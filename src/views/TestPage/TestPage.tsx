import React from 'react';
import { Link } from 'react-router-dom';

const TestPage: React.FC = () => (
  <div className="text-center mt-24">
    <h2 className="text-2xl font-bold mb-4">测试页面</h2>
    <p className="mb-6">这里是测试页面内容。</p>
    <Link
      to="/"
      className="text-indigo-500 text-lg underline cursor-pointer hover:text-indigo-700"
    >
      返回首页
    </Link>
  </div>
);

export default TestPage;
