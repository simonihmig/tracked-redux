import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { addTodo, toggleTodo } from '../actions';

export default class Todos extends Component {
  @service redux;

  @tracked input = '';

  @action
  toggleTodo(todo) {
    this.redux.dispatch(toggleTodo(todo.id));
  }

  @action
  addTodo() {
    this.redux.dispatch(addTodo(this.input));
    this.input = '';
  }

  @action
  updateInput(e) {
    this.input = e.target.value;
  }
}
