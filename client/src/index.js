import Core, { useComponent } from './core/Core'
import { store } from './store'
import {
  App,
  Loader,
  TextArea,
  Button,
  CardCreate,
  CardItem,
  CardList,
  Header,
  Input,
  NavBar,
  Search,
  TagInput,
  Select,
} from './components'
import { Link, Router, Route, Redirect, Switch } from './core/Router'
import { AuthPage, MainPage, ProfilePage, CardPage, EditPage } from './pages'
import 'materialize-css/dist/js/materialize.min'
import './styles/styles.scss'

const View = () => {
  return `
    <Router>
      ${store.listen('App')}
    </Router>
  `
}

useComponent({
  App,
  View,
  Header,
  NavBar,
  Input,
  Link,
  Router,
  Route,
  Redirect,
  Switch,
  AuthPage,
  MainPage,
  ProfilePage,
  CardPage,
  EditPage,
  Search,
  CardList,
  CardItem,
  CardCreate,
  Button,
  TextArea,
  TagInput,
  Loader,
  Select,
})

Core.render(`<View />`, document.getElementById('app'))
