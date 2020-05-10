let defaultTodos = [
  {
    id: -2,
    text: 'Consider using Redux',
    completed: true
  },
  {
    id: -1,
    text: 'Keep all state in a single tree',
    completed: false
  }
];

const todos = (state = defaultTodos, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return [
        ...state,
        {
          id: action.id,
          text: action.text,
          completed: false
        }
      ]
    case 'TOGGLE_TODO':
      return state.map(todo =>
        todo.id === action.id ? { ...todo, completed: !todo.completed } : todo
      )
    default:
      return state
  }
}

export default todos
