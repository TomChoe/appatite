import React, { Component } from 'react';
import axios from 'axios';
import { Redirect, Link } from 'react-router-dom';
import Header from '../subComponents/Header';
import RestMap from './RestMap';
import Review from '../subComponents/Review';
import { Button } from 'reactstrap';

class RestSingle extends Component {
  constructor() {
    super();
    this.state = {
      apiDataLoaded: false,
      apiData: null,
      fireRedirect: false,
      favorite: false,
      favoriteNumber: null,
      favoriteUsers: null,
      id: null,
    };
    this.deleteRestaurant = this.deleteRestaurant.bind(this);
    this.goToFavorite = this.goToFavorite.bind(this);
    this.renderFavoriteUsers = this.renderFavoriteUsers.bind(this);
  }

  componentWillReceiveProps(nextprops) {
    let getId;
    if (!this.props.id) {
      getId = this.props.match.params.id;
    } else {
      getId = this.props.id;
    }

    return axios
      .get(`/api/restaurant/${getId}`)
      .then(restaurant => {
        this.setState({
          apiDataLoaded: true,
          apiData: restaurant.data.data[0],
          id: restaurant.data.data[0].id,
        });
        axios
          .get(`/api/favorites/restaurant/num/${this.state.id}`)
          .then(favorites => {
            console.log('RESTAURANT FAVORITES ->', favorites.data.data[0]);
            this.setState({
              favoriteNumber: favorites.data.data[0].count,
            });
            axios
              .get(`/api/favorites/restaurant/users/${this.state.id}`)
              .then(users => {
                console.log(
                  'USERS WHO LIKE THE RESTAURANT--->',
                  users.data.data,
                );
                const user = users.data.data.filter(function(user) {
                  return (
                    user.username === window.localStorage.getItem('username')
                  );
                });

                if (user.length > 0) {
                  this.setState({
                    favorite: true,
                  });
                }

                this.setState({
                  favoriteUsers: users.data.data,
                });
              })
              .catch(err => {
                console.log('ERROR IN GET USERS WHO LIKE RESTAURANT--->', err);
              });
          })
          .catch(err => {
            console.log('nope :', err);
          });
      })
      .catch(err => {
        console.log(err);
      });
  }

  deleteRestaurant() {
    return axios
      .delete(`/api/restaurant/delete/${this.state.id}`)
      .then(restaurant => {
        this.setState({
          fireRedirect: true,
        });
      })
      .catch(err => {
        console.log('error deleting', err);
      });
  }

  goToFavorite() {
    return axios
      .post(
        `/api/favorites/${this.state.id}`,
        { withCredentials: true },
        {
          headers: {
            user: window.localStorage.getItem('id'),
            user_name: window.localStorage.getItem('username'),
            restaurant_name: this.state.apiData.name,
          },
        },
      )
      .then(favorite => {
        this.setState({
          favorite: true,
        });
      })
      .catch(err => {
        this.setState({
          favorite: !this.state.favorite,
        });
      });
  }

  renderFavoriteUsers() {
    return this.state.favoriteUsers.map((el, id) => {
      return (
        <Link key={el.id} to={`/user/page/${el.username}`}>
          <p>{el.username}</p>
        </Link>
      );
    });
  }

  render() {
    return (
      <div className="welcome">
        <h2>{this.state.apiDataLoaded ? this.state.apiData.name : ''}</h2>
        <Button color="primary">
          <Link to={`/main/${this.state.id}/edit`} className="welcome">
            Edit
          </Link>
        </Button>
        <Button color="primary" onClick={this.deleteRestaurant}>
          Delete posting
        </Button>
        {this.state.apiDataLoaded ? (
          <RestMap location={this.state.apiData.loc} />
        ) : (
          'failed to load map'
        )}
        <p>
          Yelp Rating:{' '}
          {this.state.apiDataLoaded ? this.state.apiData.rating : ''} Stars
        </p>
        <p>
          Number of favorites:{' '}
          {this.state.favoriteNumber > 0 ? this.state.favoriteNumber : ''}
        </p>
        <p>
          Users who Favorite:{this.state.favoriteUsers
            ? this.renderFavoriteUsers()
            : ''}
        </p>
        {this.state.apiDataLoaded ? <Review name={this.state.id} /> : ''}
        <Button color="primary" onClick={this.goToFavorite}>
          {this.state.favorite
            ? 'Unfavorite this baby!'
            : 'Favorite this baby!'}
        </Button>
        {this.state.fireRedirect ? <Redirect to="/main" /> : ''}
      </div>
    );
  }
}

export default RestSingle;
