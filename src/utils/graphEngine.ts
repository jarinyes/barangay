import { Case, GraphNode, GraphEdge, GraphCluster } from '../types';

export interface GraphBuildOptions {
  activeOnly?: boolean;
}

export function buildGraphFromCases(
  cases: Case[],
  options: GraphBuildOptions = {}
): {
  nodes: GraphNode[];
  edges: GraphEdge[];
  clusters: GraphCluster[];
} {
  const nodeMap = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];
  const edgeSet = new Set<string>();

  // Filter cases if activeOnly is requested
  const targetCases = (cases || []).filter((c) => {
    if (!c || !c.id) return false;
    if (options.activeOnly) {
      return c.isPending || (c.status !== 'Resolved' && c.status !== 'Closed' && c.status !== 'Archived');
    }
    return true;
  });

  function addNode(node: GraphNode) {
    if (!nodeMap.has(node.id)) {
      nodeMap.set(node.id, node);
    } else {
      // Merge metadata or bump degree
      const existing = nodeMap.get(node.id)!;
      existing.metadata = { ...existing.metadata, ...node.metadata };
    }
  }

  function addEdge(source: string, target: string, label: string, type: GraphEdge['type']) {
    const edgeKey = `${source}->${target}:${type}`;
    if (!edgeSet.has(edgeKey) && source !== target) {
      edgeSet.add(edgeKey);
      edges.push({
        id: `E-${edges.length + 1}`,
        source,
        target,
        label,
        type,
        weight: 1
      });
    }
  }

  // Add major agencies as structural anchor nodes
  addNode({
    id: 'AGENCY-BARANGAY',
    label: 'Barangay LGUs & Lupon',
    subLabel: 'Katarungang Pambarangay Conciliation Hub',
    type: 'agency',
    group: 'Agency',
    color: '#0284c7', // Sky blue
    radius: 22,
    metadata: {
      agency: 'Barangay LGUs & Lupon Tagapamayapa',
      jurisdiction: 'Community First-Level Amicable Settlement',
      statutoryBasis: 'Local Government Code (RA 7160 Chapter 7)'
    }
  });

  addNode({
    id: 'AGENCY-LGU',
    label: 'Roxas Municipal Administration & Executive Center',
    subLabel: 'Municipal Complex (near Bulwagan ng Katarungan) • Municipal Admin / SB / MSWDO / MENRO',
    type: 'agency',
    group: 'Agency',
    color: '#047857', // Emerald
    radius: 26,
    metadata: {
      agency: 'LGU Roxas Municipal Administration',
      fullAddress: 'Municipal Complex, Poblacion, Roxas, Oriental Mindoro',
      lat: 12.5888,
      lng: 121.5167
    }
  });

  // Process each case
  targetCases.forEach((c) => {
    if (!c || !c.id) return;
    const caseNodeId = `CASE-${c.id}`;
    const caseTitle = c.title || 'Untitled Case';
    
    // Case Node
    const caseColor = 
      c.status === 'Resolved' || c.status === 'Closed' ? '#10b981' :
      c.isInvolvingOfficial ? '#ef4444' :
      c.isPending ? '#f59e0b' : '#6366f1';

    addNode({
      id: caseNodeId,
      label: `${c.id}: ${caseTitle.length > 28 ? caseTitle.slice(0, 26) + '...' : caseTitle}`,
      subLabel: `Brgy. ${c.barangay || 'General'} • ${c.status} (${c.category || 'General'})`,
      type: 'case',
      group: 'Case',
      color: caseColor,
      radius: 20,
      rawCase: c,
      metadata: {
        caseId: c.id,
        category: c.category,
        status: c.status,
        barangay: c.barangay,
        date: c.dateReported,
        isOfficial: c.isInvolvingOfficial,
        isPending: c.isPending,
        priority: c.priority
      }
    });

    // Barangay Node
    const bgyName = c.barangay || 'Roxas';
    const bgyNodeId = `BGY-${bgyName.replace(/\s+/g, '')}`;
    addNode({
      id: bgyNodeId,
      label: `Brgy. ${bgyName}`,
      type: 'barangay',
      group: 'Barangay',
      color: '#0d9488',
      radius: 18,
      metadata: { barangay: bgyName }
    });

    addEdge(caseNodeId, bgyNodeId, 'REPORTED_IN', 'REPORTED_IN');
    addEdge(bgyNodeId, 'AGENCY-BARANGAY', 'UNDER_JURISDICTION', 'INVOLVED_IN');

    // Complainants
    (c.complainants || []).forEach((p) => {
      if (!p || !p.name) return;
      const personId = `PERSON-${p.name.replace(/\s+/g, '')}`;
      addNode({
        id: personId,
        label: p.name,
        type: 'person',
        subType: 'Complainant',
        group: 'Person',
        color: '#3b82f6',
        radius: 14,
        metadata: { role: 'Complainant', contact: p.contact, address: p.address, barangay: p.barangay || c.barangay }
      });
      addEdge(personId, caseNodeId, 'FILED_COMPLAINT', 'INVOLVED_IN');
    });

    // Respondents
    (c.respondents || []).forEach((p) => {
      if (!p || !p.name) return;
      const personId = `PERSON-${p.name.replace(/\s+/g, '')}`;
      const isOfficial = p.isOfficial || c.isInvolvingOfficial;
      addNode({
        id: personId,
        label: p.name,
        type: isOfficial ? 'official' : 'person',
        subType: 'Respondent',
        group: isOfficial ? 'Official' : 'Person',
        color: isOfficial ? '#dc2626' : '#ea580c',
        radius: isOfficial ? 16 : 14,
        metadata: {
          role: 'Respondent',
          isOfficial: !!isOfficial,
          officialPosition: p.officialPosition || c.officialInvolvedPosition,
          contact: p.contact,
          address: p.address,
          barangay: p.barangay || c.barangay
        }
      });
      addEdge(personId, caseNodeId, isOfficial ? 'INVOLVED_AS_OFFICIAL' : 'RESPONDENT_IN', isOfficial ? 'INVOLVES_OFFICIAL' : 'COMPLAINED_AGAINST');
    });

    // Witnesses / Tanods
    (c.witnesses || []).forEach((w) => {
      if (!w || !w.name) return;
      const witnessId = `PERSON-${w.name.replace(/\s+/g, '')}`;
      addNode({
        id: witnessId,
        label: w.name,
        type: 'person',
        subType: 'Witness',
        group: 'Person',
        color: '#8b5cf6', // Violet for witnesses
        radius: 13,
        metadata: { role: 'Witness', contact: w.contact, address: w.address, barangay: w.barangay || c.barangay }
      });
      addEdge(witnessId, caseNodeId, 'TESTIFIED_IN', 'INVOLVED_IN');
    });

    // Handling Officer / Official
    if (c.assignedPersonnel) {
      const officerId = `OFFICIAL-${c.assignedPersonnel.replace(/\s+/g, '')}`;
      const isPoliceOfficer = c.assignedPersonnel.includes('PMAJ') || 
                              c.assignedPersonnel.includes('PSSg') || 
                              c.assignedPersonnel.includes('Police') || 
                              c.currentHandlingAgency?.includes('Police') || 
                              c.currentHandlingAgency?.includes('PNP');

      addNode({
        id: officerId,
        label: c.assignedPersonnel,
        type: 'official',
        subType: isPoliceOfficer ? 'Police Officer' : 'Assigned Officer',
        group: 'Official',
        color: isPoliceOfficer ? '#1e40af' : '#059669', // Deep Blue for police officers, emerald for barangay officials
        radius: 16,
        metadata: {
          role: isPoliceOfficer ? 'Law Enforcement Officer' : 'Assigned Officer',
          barangay: c.barangay,
          agency: c.currentHandlingAgency || (isPoliceOfficer ? 'Roxas Municipal Police Station (PNP)' : 'Barangay LGU')
        }
      });
      addEdge(officerId, caseNodeId, isPoliceOfficer ? 'INVESTIGATING_OFFICER' : 'ASSIGNED_TO', 'INVOLVES_OFFICIAL');

      if (isPoliceOfficer) {
        addEdge(officerId, 'AGENCY-POLICE', 'STATIONED_AT', 'INVOLVED_IN');
      }
    }

    // Inter-Agency Edges & LGU Relations
    if (c.isReferredToLgu || c.currentHandlingAgency?.toLowerCase().includes('municipal')) {
      addEdge(caseNodeId, 'AGENCY-LGU', 'REFERRED_TO_LGU', 'REFERRED_TO');
      addEdge(bgyNodeId, 'AGENCY-LGU', 'MUNICIPAL_ENDORSEMENT', 'REFERRED_TO');
    }

    // Specific Location Node if distinct
    if (c.specificLocation && typeof c.specificLocation === 'string') {
      const locName = c.specificLocation.split(',')[0].trim();
      const locId = `LOC-${c.barangay || 'ROX'}-${locName.replace(/\s+/g, '')}`;
      addNode({
        id: locId,
        label: locName,
        type: 'location',
        group: 'Location',
        color: '#64748b',
        radius: 12,
        metadata: { fullAddress: c.specificLocation, barangay: c.barangay }
      });
      addEdge(caseNodeId, locId, 'LOCATED_AT', 'LOCATED_AT');
    }
  });

  // If in activeOnly mode, prune any agency anchors that have 0 edges
  if (options.activeOnly) {
    const connectedNodeIds = new Set<string>();
    edges.forEach((e) => {
      connectedNodeIds.add(e.source);
      connectedNodeIds.add(e.target);
    });
    // Keep nodes that have at least 1 edge or are part of targetCases
    for (const [id] of nodeMap) {
      if (!connectedNodeIds.has(id)) {
        nodeMap.delete(id);
      }
    }
  }

  // Graph Traversal: Cross-Case Linkages & Cluster Detection
  const personToCases = new Map<string, string[]>();
  const nodes = Array.from(nodeMap.values());

  edges.forEach((e) => {
    if (e.source.startsWith('PERSON-') && e.target.startsWith('CASE-')) {
      const p = e.source;
      const c = e.target;
      if (!personToCases.has(p)) personToCases.set(p, []);
      personToCases.get(p)!.push(c);
    }
  });

  // If a person appears in >= 2 cases, link the cases directly
  const clusters: GraphCluster[] = [];

  personToCases.forEach((caseIds, personNodeId) => {
    if (caseIds.length > 1) {
      const personNode = nodeMap.get(personNodeId);
      const personName = personNode?.label || 'Individual';
      
      for (let i = 0; i < caseIds.length; i++) {
        for (let j = i + 1; j < caseIds.length; j++) {
          addEdge(caseIds[i], caseIds[j], `COMMON_PERSON: ${personName}`, 'RELATED_CASE');
        }
      }

      const cleanCaseIds = caseIds.map(c => c.replace('CASE-', ''));
      clusters.push({
        id: `CLUST-${clusters.length + 1}`,
        title: `Repeated Involvement: ${personName}`,
        label: `Repeated Involvement: ${personName}`,
        description: `${personName} is linked to ${caseIds.length} separate cases (${cleanCaseIds.join(', ')}).`,
        nodeIds: [personNodeId, ...caseIds],
        caseIds: cleanCaseIds,
        riskLevel: personNode?.type === 'official' ? 'High' : 'Moderate',
        commonFactor: `Common Individual: ${personName}`
      });
    }
  });

  // Hotspot / Category Cluster Detection
  const categoryToCases = new Map<string, string[]>();
  targetCases.forEach((c) => {
    if (!c || !c.category) return;
    if (!categoryToCases.has(c.category)) categoryToCases.set(c.category, []);
    categoryToCases.get(c.category)!.push(`CASE-${c.id}`);
  });

  categoryToCases.forEach((caseNodeIds, category) => {
    if (caseNodeIds.length >= 2) {
      const cleanCaseIds = caseNodeIds.map(c => c.replace('CASE-', ''));
      clusters.push({
        id: `CLUST-CAT-${category.replace(/\s+/g, '')}`,
        title: `Pattern Category: ${category}`,
        label: `Pattern Category: ${category}`,
        description: `${caseNodeIds.length} incidents logged under ${category} classification.`,
        nodeIds: caseNodeIds,
        caseIds: cleanCaseIds,
        riskLevel: 'Moderate',
        commonFactor: `Incident Category: ${category}`
      });
    }
  });

  // Single active case cluster (for focused inspection)
  if (targetCases.length === 1 && targetCases[0]) {
    const singleCase = targetCases[0];
    const caseNodeId = `CASE-${singleCase.id}`;
    const connectedEntityIds = edges
      .filter(e => e.source === caseNodeId || e.target === caseNodeId)
      .map(e => (e.source === caseNodeId ? e.target : e.source));

    clusters.push({
      id: `CLUST-ACTIVE-${singleCase.id}`,
      title: `Active Incident Cluster: ${singleCase.id}`,
      label: `Active Incident: ${singleCase.id}`,
      description: `Active ongoing case in Brgy. ${singleCase.barangay} (${singleCase.status}) involving ${singleCase.complainants?.length || 0} complainant(s) and ${singleCase.respondents?.length || 0} respondent(s).`,
      nodeIds: [caseNodeId, ...connectedEntityIds],
      caseIds: [singleCase.id],
      riskLevel: singleCase.priority === 'Urgent' || singleCase.priority === 'High' ? 'High' : 'Moderate',
      commonFactor: `Active Case: ${singleCase.title}`
    });
  }

  // Calculate degrees for node importance
  nodes.forEach((n) => {
    const degree = edges.filter((e) => e.source === n.id || e.target === n.id).length;
    n.metadata.degree = degree;
    n.degree = degree;
    if (degree > 2 && n.type !== 'agency') {
      n.radius = Math.min((n.radius || 12) + degree * 1.5, 26);
    }
  });

  return { nodes, edges, clusters };
}

// Alias for convenience
export const generateGraphData = buildGraphFromCases;

export interface PathHop {
  fromNodeId: string;
  toNodeId: string;
  edgeLabel: string;
  edgeType: string;
}

export interface DetailedPath {
  nodeIds: string[];
  hops: PathHop[];
  totalDistance: number;
}

export function findDetailedPath(
  nodes: GraphNode[],
  edges: GraphEdge[],
  startNodeId: string,
  endNodeId: string
): DetailedPath | null {
  if (!startNodeId || !endNodeId) return null;
  if (startNodeId === endNodeId) {
    return { nodeIds: [startNodeId], hops: [], totalDistance: 0 };
  }

  const adj = new Map<string, { target: string; label: string; type: string }[]>();
  edges.forEach((e) => {
    if (!adj.has(e.source)) adj.set(e.source, []);
    if (!adj.has(e.target)) adj.set(e.target, []);
    adj.get(e.source)!.push({ target: e.target, label: e.label, type: e.type });
    adj.get(e.target)!.push({ target: e.source, label: e.label, type: e.type });
  });

  interface QueueItem {
    nodeId: string;
    path: string[];
    hops: PathHop[];
  }

  const queue: QueueItem[] = [{ nodeId: startNodeId, path: [startNodeId], hops: [] }];
  const visited = new Set<string>([startNodeId]);

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.nodeId === endNodeId) {
      return {
        nodeIds: current.path,
        hops: current.hops,
        totalDistance: current.hops.length
      };
    }

    const neighbors = adj.get(current.nodeId) || [];
    for (const edge of neighbors) {
      if (!visited.has(edge.target)) {
        visited.add(edge.target);
        queue.push({
          nodeId: edge.target,
          path: [...current.path, edge.target],
          hops: [
            ...current.hops,
            {
              fromNodeId: current.nodeId,
              toNodeId: edge.target,
              edgeLabel: edge.label,
              edgeType: edge.type
            }
          ]
        });
      }
    }
  }

  return null;
}

export function findShortestPath(
  nodes: GraphNode[],
  edges: GraphEdge[],
  startNodeId: string,
  endNodeId: string
): string[] {
  if (startNodeId === endNodeId) return [startNodeId];

  const adj = new Map<string, string[]>();
  edges.forEach((e) => {
    if (!adj.has(e.source)) adj.set(e.source, []);
    if (!adj.has(e.target)) adj.set(e.target, []);
    adj.get(e.source)!.push(e.target);
    adj.get(e.target)!.push(e.source);
  });

  const queue: string[][] = [[startNodeId]];
  const visited = new Set<string>([startNodeId]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const node = path[path.length - 1];

    if (node === endNodeId) {
      return path;
    }

    const neighbors = adj.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }

  return [];
}
