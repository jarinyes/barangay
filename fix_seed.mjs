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
          
          // Remove isRemainedAtBarangay
          const prop = obj.getProperty('isRemainedAtBarangay');
          if (prop) {
            prop.remove();
          }

          // Fix timeline stage
          const timelineProp = obj.getProperty('timeline');
          if (timelineProp && timelineProp.getKind() === SyntaxKind.PropertyAssignment) {
            const tlAssign = timelineProp.asKind(SyntaxKind.PropertyAssignment);
            const init = tlAssign.getInitializerIfKind(SyntaxKind.ArrayLiteralExpression);
            if (init) {
              for (const tlElem of init.getElements()) {
                if (tlElem.getKind() === SyntaxKind.ObjectLiteralExpression) {
                   const tlObj = tlElem.asKind(SyntaxKind.ObjectLiteralExpression);
                   const stageProp = tlObj.getProperty('stage');
                   if (stageProp && stageProp.getKind() === SyntaxKind.PropertyAssignment) {
                      const propAssign = stageProp.asKind(SyntaxKind.PropertyAssignment);
                      const propInit = propAssign.getInitializer();
                      if (propInit && propInit.getKind() === SyntaxKind.StringLiteral) {
                        const val = propInit.getText();
                        if (val === "'Referral Sent'") {
                          propAssign.setInitializer("'Status Update'");
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
