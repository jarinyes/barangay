import { Project, SyntaxKind } from 'ts-morph';

const project = new Project();
project.addSourceFilesAtPaths('src/data/seedData.ts');

const seedFile = project.getSourceFile('src/data/seedData.ts');
if (seedFile) {
  const caseVars = seedFile.getVariableDeclaration('SEED_CASES');
  if (caseVars) {
    const arrayLiteral = caseVars.getInitializerIfKind(SyntaxKind.ArrayLiteralExpression);
    if (arrayLiteral) {
      for (const element of arrayLiteral.getElements()) {
        if (element.getKind() === SyntaxKind.ObjectLiteralExpression) {
          const obj = element.asKind(SyntaxKind.ObjectLiteralExpression);
          
          const historyProp = obj.getProperty('statusHistory');
          if (historyProp && historyProp.getKind() === SyntaxKind.PropertyAssignment) {
            const histAssign = historyProp.asKind(SyntaxKind.PropertyAssignment);
            const init = histAssign.getInitializerIfKind(SyntaxKind.ArrayLiteralExpression);
            if (init) {
              for (const histElem of init.getElements()) {
                if (histElem.getKind() === SyntaxKind.ObjectLiteralExpression) {
                   const histObj = histElem.asKind(SyntaxKind.ObjectLiteralExpression);
                   
                   const prevProp = histObj.getProperty('previousStatus');
                   if (prevProp && prevProp.getKind() === SyntaxKind.PropertyAssignment) {
                      const propAssign = prevProp.asKind(SyntaxKind.PropertyAssignment);
                      const propInit = propAssign.getInitializer();
                      if (propInit && propInit.getKind() === SyntaxKind.StringLiteral) {
                        const val = propInit.getText();
                        if (val === "'Resolved'" || val === "'Closed'") {
                          propAssign.setInitializer("'Resolved'");
                        } else {
                          propAssign.setInitializer("'Unresolved'");
                        }
                      }
                   }

                   const newProp = histObj.getProperty('newStatus');
                   if (newProp && newProp.getKind() === SyntaxKind.PropertyAssignment) {
                      const propAssign = newProp.asKind(SyntaxKind.PropertyAssignment);
                      const propInit = propAssign.getInitializer();
                      if (propInit && propInit.getKind() === SyntaxKind.StringLiteral) {
                        const val = propInit.getText();
                        if (val === "'Resolved'" || val === "'Closed'") {
                          propAssign.setInitializer("'Resolved'");
                        } else {
                          propAssign.setInitializer("'Unresolved'");
                        }
                      }
                   }
                }
              }
            }
          }
        }
      }
    }
  }
  
  seedFile.saveSync();
}
