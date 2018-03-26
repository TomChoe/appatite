import React, {Component} from 'react';
import axios from 'axios';
import {Link} from 'react-router-dom';
import {Button} from 'reactstrap';
class Review extends Component {
  constructor() {
    super();
    this.state = {
      initialReviews: false,
      apiData: null,
      showForm: false,
      showAll: false,
      user: window.localStorage.getItem('username'),
      user_id: '',
      restaurant_id: '',
      restaurant_name: '',
      content: '',
      fireRedirect: false,
      restaurantName: '',
      showMore: false,
    };
    this.inputChange = this.inputChange.bind(this);
    this.formSubmit = this.formSubmit.bind(this);
    this.buttonClickForm = this.buttonClickForm.bind(this);
    this.buttonClickAll = this.buttonClickAll.bind(this);
  }

  componentWillReceiveProps() {
    axios.get(`/api/review/${this.props.name}`).then(review => {
      console.log(review.data.data);
      let showMoreReviews;
      if (review.data.data.length > 3) {
        showMoreReviews = true;
      } else {
        showMoreReviews = false;
      }
      this.setState({initialReviews: true, apiData: review.data.data, showMore: showMoreReviews});
    }).catch(err => {
      console.log('no reviews exists');
    });
  }

  buttonClickForm() {
    console.log(this.props.name);
    axios.get(`/api/restaurant/${this.props.name}`).then(restaurant => {
      this.setState({
        showForm: !this.state.showForm,
        restaurantName: restaurant.data.data[0].name
      });
    }).catch(err => {
      console.log('getting the restaurant failed--->', err);
    });
  }

  buttonClickAll() {
    this.setState({
      showAll: !this.state.showAll,
      initialReviews: !this.state.initialReviews
    });
  }

  inputChange(e) {
    let name = e.target.name;
    let value = e.target.value;
    console.log(e.target.name);
    this.setState({[name]: value});
  }

  formSubmit(e) {
    e.preventDefault();
    axios({
      method: 'POST',
      url: `/api/review/${this.props.name}`,
      data: {
        user_id: window.localStorage.getItem('id'),
        username: window.localStorage.getItem('username'),
        restaurant_id: this.props.name,
        restaurant_name: this.state.restaurantName,
        content: this.state.content
      }
    }).then(review => {
      console.log('submitting review', review);
      this.setState({fireRedirect: true});
    }).catch(err => {
      console.log('error in review', err);
    });
  }
  renderFavoriteUsers() {
    let linkRoute;
    return this.state.favoriteUsers.map((el, id) => {
      if (el.username === window.localStorage.getItem('username')) {
        linkRoute = `/user/account`;
      } else {
        linkRoute = `/user/page/${el.username}`
      }
      return (<Link key={el.id} to={linkRoute}>
        <p>{el.username}</p>
      </Link>);
    });
  }

  showReviews() {
    let linkRoute;
    if (this.state.initialReviews) {
      return this.state.apiData.map((el, i) => {
        if (el.username === window.localStorage.getItem('username')) {
          linkRoute = `/user/account`;
        } else {
          linkRoute = `/user/page/${el.username}`
        }

        // shows initial 3
        if (i < 3) {
          return (<p>
            <Link key={el.id} to={linkRoute}>
              <i>{el.username}:
              </i>
            </Link>
            {el.content}
          </p>);
        }
      });
    }
  }

  showAllReviews() {
    let linkRoute;
    if (this.state.showAll) {
      return this.state.apiData.map(el => {
        if (el.username === window.localStorage.getItem('username')) {
          linkRoute = `/user/account`;
        } else {
          linkRoute = `/user/page/${el.username}`;
        }

        return (<p>
          <Link key={el.id} to={linkRoute}>
            <i>{el.username}:
            </i>
          </Link>
          {el.content}
        </p>);
      });
    }
  }

  render() {
    return (
      <div className="review">
        {this.state.initialReviews ? this.showReviews() : ''}
        {this.state.showAll ? this.showAllReviews() : ''}
        {this.state.showMore ? <Button color='primary' onClick={this.buttonClickAll}>All Reviews</Button> : ''}
        <br/>
        <br/>
        <div class="form-group">
          <Button color='primary' onClick={this.buttonClickForm}>Leave a Review</Button>
          <div class="col align-self-center">
            {this.state.showForm ? (
              <form onSubmit={this.formSubmit}>
                <input
                  type="hidden"
                  name={window.localStorage.getItem('username')}
                />
                <input
                  type="hidden"
                  name="restaurant_name"
                  value={this.props.name}
                />
                <textarea
                  className="form-control"
                  type="text"
                  rows="3"
                  onChange={this.inputChange}
                  name="content"
                  placeholder={`leave a review for ${
                    this.state.restaurantName
                  }`}
                />
                <input class="btn btn-primary" type="submit" value="submit"/>
              </form>
            ) : (
              ''
            )}
          </div>
        </div>
      </div>);
  }
}

export default Review;
