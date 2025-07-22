import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from '../views/Home'
import ModelViewer from '../views/ModelViewer'
import TestPage from '../views/TestPage'
import Test2Page from '../views/Test2Page'

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/model" element={<ModelViewer />} />
    <Route path="/test" element={<TestPage />} />
    <Route path="/test2" element={<Test2Page />} />
  </Routes>
)

export default AppRoutes
