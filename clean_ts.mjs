import { Project, SyntaxKind } from 'ts-morph';

const project = new Project();
project.addSourceFilesAtPaths('src/**/*.ts');
project.addSourceFilesAtPaths('src/**/*.tsx');

const seedFile = project.getSourceFile('src/data/seedData.ts');
if (seedFile) {
  const caseVars = seedFile.getVariableDeclaration('SEED_CASES');
  if (caseVars) {
    const arrayLiteral = caseVars.getInitializerIfKind(SyntaxKind.ArrayLiteralExpression);
    if (arrayLiteral) {
      for (const element of arrayLiteral.getElements()) {
        if (element.getKind() === SyntaxKind.ObjectLiteralExpression) {
          const obj = element.asKind(SyntaxKind.ObjectLiteralExpression);
          const propertiesToRemove = [
            'photos', 'attachments', 'referrals', 'dilgRecommendations',
            'isPending', 'daysPending', 'lastActionTaken', 'requiredNextAction',
            'pendingReason', 'pendingExplanation', 'isReferredToPolice', 'isReferredToLgu',
            'lguEndorsementNo', 'policeCaseNo', 'isMonitoredByDilg',
            'resolutionSummary', 'dateResolved', 'dateClosed', 'outcomeType'
          ];
          for (const propName of propertiesToRemove) {
            const prop = obj.getProperty(propName);
            if (prop) {
              prop.remove();
            }
          }
          const statusProp = obj.getProperty('status');
          if (statusProp && statusProp.getKind() === SyntaxKind.PropertyAssignment) {
            const statusAssign = statusProp.asKind(SyntaxKind.PropertyAssignment);
            const init = statusAssign.getInitializer();
            if (init && init.getKind() === SyntaxKind.StringLiteral) {
               const val = init.getText();
               if (val === "'Resolved'" || val === "'Closed'") {
                 statusAssign.setInitializer("'Resolved'");
               } else {
                 statusAssign.setInitializer("'Unresolved'");
               }
            }
          }
        }
      }
    }
  }
  
  // also update SEED_NOTIFICATIONS to remove pending_alert, recommendation, referral types
  const notifVars = seedFile.getVariableDeclaration('SEED_NOTIFICATIONS');
  if (notifVars) {
    const arrayLiteral = notifVars.getInitializerIfKind(SyntaxKind.ArrayLiteralExpression);
    if (arrayLiteral) {
      const elements = arrayLiteral.getElements();
      for (let i = elements.length - 1; i >= 0; i--) {
        const element = elements[i];
        if (element.getKind() === SyntaxKind.ObjectLiteralExpression) {
           const obj = element.asKind(SyntaxKind.ObjectLiteralExpression);
           const typeProp = obj.getProperty('type');
           if (typeProp && typeProp.getKind() === SyntaxKind.PropertyAssignment) {
             const typeAssign = typeProp.asKind(SyntaxKind.PropertyAssignment);
             const init = typeAssign.getInitializer();
             if (init && init.getKind() === SyntaxKind.StringLiteral) {
                const val = init.getText();
                if (val === "'pending_alert'" || val === "'recommendation'" || val === "'referral'") {
                   arrayLiteral.removeElement(i);
                }
             }
           }
        }
      }
    }
  }
  
  seedFile.saveSync();
}
