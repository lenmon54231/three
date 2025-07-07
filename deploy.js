import path, { dirname } from 'path';
import Client from 'ssh2-sftp-client';
import { fileURLToPath } from 'url';

// 获取当前模块的目录路径
const __dirname = dirname(fileURLToPath(import.meta.url));

async function uploadDist() {
  const sftp = new Client();
  const serverIp = '43.153.23.253'; // 替换为你的服务器 IP
  const username = 'root'; // 替换为你的服务器用户名
  const password = 'Qwer54231!'; // 替换为你的服务器密码
  const localPath = path.join(__dirname, 'dist'); // 本地 dist 文件夹路径
  const remotePath = '/www/wwwroot/3dweb.top'; // 服务器上的目标文件夹路径

  console.log('localPath', localPath);
  console.log('remotePath', remotePath);
  try {
    await sftp.connect({
      host: serverIp,
      username: username,
      password: password,
    });
    console.log('Connected to server');

    // 监听 upload 事件
    sftp.on('upload', (info) => {
      console.log(info.destination, '--------------------');
    });

    await sftp.uploadDir(localPath, remotePath);
    console.log('Files uploaded successfully');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sftp.end();
  }
}

uploadDist();
