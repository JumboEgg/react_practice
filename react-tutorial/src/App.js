// import './App.css';
import Table from './Table'
import Form from './Form'
import React, { Component } from 'react'

const characters = [
  {
    name: 'Charlie',
    job: 'Janitor'
  },
  {
    name: 'Mac',
    job: 'Bouncer'
  },
  {
    name: 'Dee',
    job: 'Aspring actress'
  },
  {
    name: 'Dennis',
    job: 'Bartender'
  }
]

// function App() {
//   return (
//     <div className="container">
//       <h1>Hello, React!</h1>
//       <Table characterData={characters} />
//     </div>
//   );
// }

class App extends Component {
  state = {
    characters: characters
  }

  removeCharacter = (index) => {
    const { characters } = this.state
    this.setState({
      characters: characters.filter((character, i) => {
        return i !== index
      })
    })
  }

  handleSubmit = (character) => {
    this.setState({
      // 기존 characters 배열 뒤에 새로운 요소 추가가
      characters: [...this.state.characters, character]
    })
  }

  render() {
    const { characters } = this.state

    return (
      <div className="container">
        <h1>Hello, React!</h1>
        <Table characterData={characters} removeCharacter={this.removeCharacter}/>
        <br/>
        <Form handleSubmit={this.handleSubmit}/>
      </div>
    );
  }
}

export default App;
