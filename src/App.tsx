import Header from './components/layout/Header'
import Container from './components/containers/Container'
import Footer from './components/layout/Footer'
import ChartWrapper from './features/chart/components/ChartWrapper'
import Estadisticas from './features/estadisticas/components/Estadisticas'

function App() {
 

  return (
    <div className="min-h-screen flex gap-8 flex-col justify-between bg-gray-50 text-gray-800">
      <Header/>
      <Container className='flex flex-col gap-4 lg:flex-row'>
        <ChartWrapper/>
        <Estadisticas/>
      </Container>
      <Footer/>
    </div>
  )
}

export default App
