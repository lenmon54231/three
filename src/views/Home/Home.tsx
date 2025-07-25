import Button from '@/components/Button/Button'
import React from 'react'
import { useNavigate } from 'react-router-dom'

const Home: React.FC = () => {
  const navigate = useNavigate()
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#222] text-white">
      <Button
        className="text-xl px-10 py-4 m-4 rounded-lg border-none bg-indigo-500 text-white cursor-pointer transition hover:bg-indigo-600"
        onClick={() => navigate('/model')}>
        SU7模型
      </Button>
      <Button
        className="text-xl px-10 py-4 m-4 rounded-lg border-none bg-indigo-700 text-white cursor-pointer transition hover:bg-indigo-800"
        onClick={() => navigate('/rain')}>
        水滴shader
      </Button>
      <Button
        className="text-xl px-10 py-4 m-4 rounded-lg border-none bg-indigo-700 text-white cursor-pointer transition hover:bg-indigo-800"
        onClick={() => navigate('/test')}>
        进入测试页面
      </Button>
      <Button
        className="text-xl px-10 py-4 m-4 rounded-lg border-none bg-indigo-700 text-white cursor-pointer transition hover:bg-indigo-800"
        onClick={() => navigate('/test2')}>
        进入测试页面
      </Button>
    </div>
  )
}

export default Home
