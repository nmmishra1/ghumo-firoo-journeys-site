const git = require('isomorphic-git');
const fs = require('fs');
const path = require('path');

const dir = __dirname;

async function checkStatus() {
  const status = await git.status({
    fs,
    dir,
    filepath: 'src/pages/CRM.tsx'
  });
  console.log('CRM.tsx git status:', status);
}

checkStatus().catch(console.error);
