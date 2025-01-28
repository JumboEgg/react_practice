import io from 'socket.io-client';
import './App.css'
import { useEffect, useState } from 'react';

export interface chatMsg {
  name: string;
  message: string;
}

const socket = io('http://localhost:3869');

function App() {
  const [state, setState] = useState<chatMsg>({message:'', name:''})
  const [chat,setChat] =useState<chatMsg[]>([])

  useEffect(() => {
    socket.on('message',({name,message})=>{
      setChat([...chat,{name,message}])
    })
  }, [])

  function onTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    setState({...state,[e.target.name]: e.target.value})
  }

  function onMessageSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const {name, message} =state
    socket.emit('message',{name, message})
    setState({message : '',name})
  }


  function renderChat() {
    return chat.map(({name, message},index)=>(
      <div key={index}>
        <h3>{name}:<span>{message}</span></h3>
      </div>
    ))
  }

  return (
    <div className='card'>
      <form onSubmit={onMessageSubmit}>
        <h1>Message</h1>
        <div className="name-field">
          <input 
          name ="name" 
          onChange={e=> onTextChange(e)} 
          value={state.name}/>
        </div>
        <div >
          <input 
          name ="message" 
          onChange={e=> onTextChange(e)} 
          value={state.message}
          id="outlined-multiline-static"/>
        </div>
        <button>Send Message</button>
      </form>
      <div className="render-chat">
        <h1>Chat log</h1>
        {renderChat()}
      </div>
    </div>
  )
}

export default App
