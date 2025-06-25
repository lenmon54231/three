// @ts-nocheck
import shell from 'shelljs'

const runGit = async function () {
  let currentTime = String(
    new Date().toLocaleString("chinese", { hour12: false })
  );
  let commitStr = `git commit -m "${currentTime}"`;
  shell.exec("git pull", { silent: true });
  shell.echo("git pull完成");
  shell.exec("git add .", { silent: true });
  shell.echo("git add .完成");
  shell.exec(commitStr, { silent: true });
  shell.echo("git commit完成");
  shell.exec("git push");
  shell.echo("git操作完成");
  return true;
};

runGit();

