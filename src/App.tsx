import Space from "./Components/SpaceMain/Space"
import { Analytics } from "@vercel/analytics/next"


const App = () => {
  return (
    <div>
      <Analytics/>
      <Space/>
      </div>
  )
}

export default App