import React, { Component } from 'react';
import axios from 'axios';
import { BrowserRouter, Link } from 'react-router-dom';
import TokenService from '../../Auth/Services/TokenService';
import Header from '../subComponents/Header';
import Welcome from '../Welcome';
import RestaurantUserFavorites from '../RestaurantComponents/RestaurantUserFavorites';

class Home extends Component {
  constructor() {
    super();
    this.state = {
      apiDataLoaded: false,
      apiData: null,
      show: false,
      logoutUser: false,
      lat: null,
      long: null,
      followers: null,
      numFollowers: null,
      showFollowCount: false,
    };
    this.getLocation = this.getLocation.bind(this);
    this.showPosition = this.showPosition.bind(this);
    this.logout = this.logout.bind(this);
    this.follow = this.follow.bind(this);
    this.displayFollowers = this.displayFollowers.bind(this);
    this.displayFollowersCount = this.displayFollowersCount.bind(this);
  }

  componentDidMount() {
    axios
      .get(`/api/follower/friend/${this.props.match.params.id}`)
      .then(followers => {
        console.log('GETTING FOLLOWERS IN REACT WORKED ->', followers.data.data);
        this.setState({
          apiDataLoaded: true,
          followers: followers.data.data,
        });
        axios
          .get(`/api/follower/friend/num/${this.props.match.params.id}`)
          .then(totalFollowers => {
            console.log(
              'GETTING NUMBER OF FOLLOWERS IN REACT WORKED--->',
              totalFollowers.data.data,
            );
            this.setState({
              showFollowCount: true,
              numFollowers: totalFollowers.data.data,
            });
          })
          .catch(err => {
            console.log('GETTING NUMBER OF FOLLOWERS IN REACT FAILED--->', err);
          });
      })
      .catch(err => {
        console.log('GETTING FOLLOWERS IN REACT FAILED--->', err);
      });
  }

  logout(ev) {
    ev.preventDefault();
    TokenService.destroy();
    this.setState({
      logoutUser: true,
    });
  }

  getLocation() {
    if (navigator.geolocation) {
      console.log('getting users position');
      navigator.geolocation.getCurrentPosition(this.showPosition);
    } else {
      console.log('Geolocation is not supported by this browser.');
    }
  }

  showPosition(position) {
    console.log('users location has been set', position);
    this.setState({
      lat: position.coords.latitude,
      long: position.coords.longitude,
    });
  }

  follow() {
    return axios
      .post(
        `/api/follower/add/${this.props.match.params.id}`,
        { withCredentials: true },
        {
          headers: {
            user: window.localStorage.getItem('username'),
          },
        },
      )
      .then(followers => {
        console.console.log('GOT FOLLOWERS SINGLE PAGE--->', followers);
        this.setState({
          followers: true,
        });
      })
      .catch(err => {
        console.log('ERROR IN FOLLOWERS SINGLE PAGE--->', err);
      });
  }

  displayFollowers() {
    console.log(this.state.followers);
    return this.state.followers.map(el => {
      let showHome = el.user_id === window.localStorage.getItem('username');
      return (
        <div>{el.user_id === window.localStorage.getItem('username') ? <Link to={`/user/account`}><p>{el.user_id}</p></Link> : <Link to={`/user/page/${el.user_id}`}><p>{el.user_id}</p></Link>}</div>
      );
    });
  }

  displayFollowersCount() {
    console.log(this.state.numFollowers);
    let insertString = '';
    if (this.state.numFollowers[0].count > 1) {
      insertString = 's';
    }

    return (
      <div>
        <p>User {this.props.match.params.id} has {this.state.numFollowers[0].count} follower{insertString}!</p>
      </div>
    )
  }

  render() {
    if (this.state.logoutUser) {
      return <Welcome />;
    } else {
      return (
        <div className="container-fluid">
          <Header />
          <div className="jumbotron">
            <h1>Welcome to {this.props.match.params.id}'s page!</h1>
          </div>
          {this.state.showFollowCount ? this.displayFollowersCount() : ''}
          {this.state.apiDataLoaded ? this.displayFollowers() : ''}
          <RestaurantUserFavorites userPage={this.props.match.params.id} user={window.localStorage.getItem('id')}/>
          <button onClick={this.follow}>Follow?</button>
          <button onClick={this.logout}>Logout?</button>
          {/* <Footer /> */}
        </div>
      );
    }
  }
}

export default Home;
