import fs from 'fs';
import ora from 'ora';
import path, { dirname } from 'path';
import Client from 'ssh2-sftp-client';
import { fileURLToPath } from 'url';

let spinner = null; // 加载动画实例

// 获取当前模块的目录路径
const __dirname = dirname(fileURLToPath(import.meta.url));
// 统计目录中的文件总数
function countFiles(dir) {
  let count = 0;
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      count += countFiles(filePath); // 递归统计子目录中的文件
    } else {
      count++;
    }
  });
  return count;
}
async function uploadDist() {
  spinner = ora('连接到服务器...').start();

  const sftp = new Client();
  const serverIp = '43.153.23.253'; // 替换为你的服务器 IP
  const username = 'root'; // 替换为你的服务器用户名
  const password = 'Qwer54231!'; // 替换为你的服务器密码
  const localPath = path.join(__dirname, 'dist'); // 本地 dist 文件夹路径
  const remotePath = '/www/wwwroot/3dweb.top'; // 服务器上的目标文件夹路径

  let deployNum = 0;
  const totalNum = countFiles(localPath);

  try {
    await sftp.connect({
      host: serverIp,
      username: username,
      password: password,
    });
    spinner.succeed('云服务器连接成功');

    spinner.start();
    spinner.text = '开始上传dist文件夹...';

    // 监听 upload 事件
    sftp.on('upload', (info) => {
      deployNum++;
      spinner.text = `上传文件进度: (${deployNum}/${totalNum})`;
    });

    await sftp.uploadDir(localPath, remotePath);
    spinner.succeed('文件上传完成');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sftp.end();
  }
}

uploadDist();
