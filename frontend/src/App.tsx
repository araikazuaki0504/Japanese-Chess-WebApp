import { useState } from "react";

import UserTypeSelect from "./app/UserTypeSelect";
import ShogiWindow from "./app/ShogiWindow";

function App() {
  const [ isSetecteduserType, setIsSetecteduserType ] = useState<boolean>(false);

  if (isSetecteduserType) return <ShogiWindow />;
  else return <UserTypeSelect setIsSelect={setIsSetecteduserType} />;
}

export default App;
