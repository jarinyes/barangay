const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const AUTH_KEYS = new Set(['isAuthenticated', 'isAuthLoading', 'login', 'loginWithCredentials', 'logout', 'currentUser', 'setCurrentUser', 'users', 'registerUser', 'updateUser', 'deleteUser', 'clearAllUsers', 'resetToDefaults']);
const CASE_KEYS = new Set(['cases', 'auditLogs', 'selectedCaseId', 'setSelectedCaseId', 'selectedCase', 'createCase', 'updateCaseStatus', 'addCaseTimelineEvent', 'logActivity']);
const NOTIF_KEYS = new Set(['notifications', 'triggerNotification', 'markNotificationAsRead', 'markAllNotificationsAsRead', 'userNotifications', 'unreadNotifCount']);
const UI_KEYS = new Set(['activeTab', 'setActiveTab', 'isNewCaseModalOpen', 'setIsNewCaseModalOpen', 'isCreateAccountModalOpen', 'setIsCreateAccountModalOpen', 'isEditAccountModalOpen', 'setIsEditAccountModalOpen', 'userToEdit', 'setUserToEdit', 'openEditAccountModal', 'searchQuery', 'setSearchQuery', 'filterBarangay', 'setFilterBarangay', 'filterStatus', 'setFilterStatus', 'filterCategory', 'setFilterCategory', 'filterOfficialInvolved', 'setFilterOfficialInvolved', 'filterAgency', 'setFilterAgency', 'graphData']);

const files = execSync('find /home/keil/barangay/src -type f -name "*.tsx" | grep -v AppContext.tsx | grep -v App.tsx').toString().trim().split('\n');

for (const file of files) {
  if (!file) continue;
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('useApp')) continue;

  console.log(`Processing ${file}`);

  // Regex to match: const { ... } = useApp();
  // Using a robust regex that handles multiline
  const useAppRegex = /const\s*{\s*([^}]+)\s*}\s*=\s*useApp\(\)\s*;/g;
  
  content = content.replace(useAppRegex, (match, keysStr) => {
    // Extract the keys
    const keys = keysStr.split(',').map(k => k.trim()).filter(k => k.length > 0);
    
    const authList = [];
    const caseList = [];
    const notifList = [];
    const uiList = [];
    
    for (const keyRaw of keys) {
      // Handle renaming e.g. "activeTab: currentTab"
      const key = keyRaw.split(':')[0].trim();
      if (AUTH_KEYS.has(key)) authList.push(keyRaw);
      else if (CASE_KEYS.has(key)) caseList.push(keyRaw);
      else if (NOTIF_KEYS.has(key)) notifList.push(keyRaw);
      else if (UI_KEYS.has(key)) uiList.push(keyRaw);
      else console.error(`Unknown key: ${key} in ${file}`);
    }
    
    let replacement = '';
    if (authList.length > 0) replacement += `const { ${authList.join(', ')} } = useAuth();\n  `;
    if (caseList.length > 0) replacement += `const { ${caseList.join(', ')} } = useCases();\n  `;
    if (notifList.length > 0) replacement += `const { ${notifList.join(', ')} } = useNotifications();\n  `;
    if (uiList.length > 0) replacement += `const { ${uiList.join(', ')} } = useUI();\n  `;
    
    return replacement.trim();
  });

  // Replace imports
  // First, find the relative path to context/AppContext
  const importMatch = content.match(/import\s*{\s*useApp\s*}\s*from\s*['"](.*?)context\/AppContext['"]\s*;/);
  let relPath = '../../';
  if (importMatch) {
    relPath = importMatch[1];
  } else {
    // If it was imported with other things
    const importMatch2 = content.match(/import\s*\{([^}]*useApp[^}]*)\}\s*from\s*['"](.*?)context\/AppContext['"]\s*;/);
    if (importMatch2) {
      relPath = importMatch2[2];
      // It's too complex, just guess based on directory depth
    }
  }

  const depth = (file.match(/\//g) || []).length - 4; // /home/keil/barangay/src is 4
  const prefix = depth === 0 ? './' : '../'.repeat(depth);

  // We need to add imports for the used hooks
  let newImports = '';
  if (content.includes('useAuth(')) newImports += `import { useAuth } from '${prefix}hooks/useAuth';\n`;
  if (content.includes('useCases(')) newImports += `import { useCases } from '${prefix}hooks/useCases';\n`;
  if (content.includes('useNotifications(')) newImports += `import { useNotifications } from '${prefix}hooks/useNotifications';\n`;
  if (content.includes('useUI(')) newImports += `import { useUI } from '${prefix}hooks/useUI';\n`;

  // Replace the old import
  content = content.replace(/import\s*\{[^}]*useApp[^}]*\}\s*from\s*['"][^'"]*context\/AppContext['"]\s*;\n?/, newImports);
  
  fs.writeFileSync(file, content);
}
console.log('Done!');
