import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import Charts from '../components/Charts'
import '../app/globals.css';
export default function Home() {
  return (
    <>
    <div className="flex">
    <Sidebar/>
    <main className="flex-grow ml-64 relative">
          <Navbar />
          <Charts/>
    </main>
    </div>
    </>
  )
}