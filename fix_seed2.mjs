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
          
          // Remove barangayRetentionNotes
          const prop = obj.getProperty('barangayRetentionNotes');
          if (prop) {
            prop.remove();
          }
        }
      }
    }
  }
  
  seedFile.saveSync();
}
