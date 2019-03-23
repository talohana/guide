import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Modal
} from '@material-ui/core'
import {
  MoreVert,
  Favorite,
  FavoriteBorder,
  Star,
  StarBorder
} from '@material-ui/icons'
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now'
import times from 'lodash/times'
import remove from 'lodash/remove'
import find from 'lodash/find'
import gql from 'graphql-tag'
import { graphql, compose } from 'react-apollo'
import { propType } from 'graphql-anywhere'

import ReviewForm from './ReviewForm'

import { REVIEW_ENTRY, REVIEWS_QUERY } from '../graphql/Review'

const StarRating = ({ rating }) => (
  <div>
    {times(rating, i => (
      <Star key={i} />
    ))}
    {times(5 - rating, i => (
      <StarBorder key={i} />
    ))}
  </div>
)

class Review extends Component {
  state = {
    anchorEl: null,
    deleteConfirmationOpen: false,
    editing: false
  }

  openMenu = event => {
    this.setState({ anchorEl: event.currentTarget })
  }

  closeMenu = () => {
    this.setState({ anchorEl: null })
  }

  edit = () => {
    this.closeMenu()
    this.setState({ editing: true })
  }

  doneEditing = () => {
    this.setState({ editing: false })
  }

  openDeleteConfirmation = () => {
    this.closeMenu()
    this.setState({ deleteConfirmationOpen: true })
  }

  closeDeleteConfirmation = () => {
    this.setState({ deleteConfirmationOpen: false })
  }

  delete = () => {
    this.closeDeleteConfirmation()
    this.props.delete(this.props.review.id, this.props.orderBy).catch(e => {
      if (find(e.graphQLErrors, { message: 'unauthorized' })) {
        alert('👮‍♀️✋ You can only delete your own reviews!')
      }
    })
  }

  toggleFavorite = () => {
    const {
      review: { id, favorited }
    } = this.props
    this.props.favorite(id, !favorited)
  }

  render() {
    const {
      review: { text, stars, createdAt, favorited, author },
      user
    } = this.props

    const linkToProfile = child => (
      <a
        href={`https://github.com/${author.username}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {child}
      </a>
    )

    return (
      <div>
        <Card className="Review">
          <CardHeader
            avatar={linkToProfile(
              <Avatar alt={author.name} src={author.photo} />
            )}
            action={
              user && (
                <IconButton onClick={this.openMenu}>
                  <MoreVert />
                </IconButton>
              )
            }
            title={linkToProfile(author.name)}
            subheader={stars && <StarRating rating={stars} />}
          />
          <CardContent>
            {text ? (
              <Typography component="p">{text}</Typography>
            ) : (
              <Typography component="i">Text private</Typography>
            )}
          </CardContent>
          <CardActions>
            <Typography className="Review-created">
              {distanceInWordsToNow(createdAt)} ago
            </Typography>
            <div className="Review-spacer" />
            {user && (
              <IconButton onClick={this.toggleFavorite}>
                {favorited ? <Favorite /> : <FavoriteBorder />}
              </IconButton>
            )}
          </CardActions>
        </Card>

        <Menu
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.closeMenu}
        >
          <MenuItem onClick={this.edit}>Edit</MenuItem>
          <MenuItem onClick={this.openDeleteConfirmation}>Delete</MenuItem>
        </Menu>

        <Dialog
          open={this.state.deleteConfirmationOpen}
          onClose={this.closeDeleteConfirmation}
        >
          <DialogTitle>{'Delete review?'}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              A better UX is probably just letting you single-click delete with
              an undo toast, but that's harder to code right{' '}
              <span role="img" aria-label="grinning face">
                😄
              </span>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.closeDeleteConfirmation}>Cancel</Button>
            <Button onClick={this.delete} color="primary" autoFocus>
              Sudo delete
            </Button>
          </DialogActions>
        </Dialog>

        <Modal open={this.state.editing} onClose={this.doneEditing}>
          <ReviewForm done={this.doneEditing} review={this.props.review} />
        </Modal>
      </div>
    )
  }
}

Review.propTypes = {
  review: propType(REVIEW_ENTRY).isRequired,
  favorite: PropTypes.func.isRequired,
  user: PropTypes.object,
  orderBy: PropTypes.string.isRequired
}

const FAVORITE_REVIEW_MUTATION = gql`
  mutation FavoriteReview($id: ObjID!, $favorite: Boolean!) {
    favoriteReview(id: $id, favorite: $favorite) {
      id
      favorited
    }
  }
`

const READ_USER_FAVORITES = gql`
  query ReadUserFavorites {
    currentUser {
      id
      favoriteReviews {
        id
      }
    }
  }
`

const withFavoriteMutation = graphql(FAVORITE_REVIEW_MUTATION, {
  props: ({ mutate }) => ({
    favorite: (id, favorite) =>
      mutate({
        variables: { id, favorite },
        optimisticResponse: {
          favoriteReview: {
            __typename: 'Review',
            id,
            favorited: favorite
          }
        },
        update: store => {
          const data = store.readQuery({ query: READ_USER_FAVORITES })

          if (favorite) {
            data.currentUser.favoriteReviews.push({ id, __typename: 'Review' })
          } else {
            remove(data.currentUser.favoriteReviews, { id })
          }

          store.writeQuery({ query: READ_USER_FAVORITES, data })
        }
      })
  })
})

const DELETE_REVIEW_MUTATION = gql`
  mutation DeleteReview($id: ObjID!) {
    removeReview(id: $id)
  }
`

const withDeleteMutation = graphql(DELETE_REVIEW_MUTATION, {
  props: ({ mutate }) => ({
    delete: (id, orderBy) =>
      mutate({
        variables: { id },
        optimisticResponse: {
          removeReview: true
        },
        update: store => {
          const query = {
            query: REVIEWS_QUERY,
            variables: { limit: 10, orderBy }
          }

          let data = store.readQuery(query)
          remove(data.reviews, { id })
          store.writeQuery({ ...query, data })

          data = store.readQuery({ query: READ_USER_FAVORITES })
          remove(data.currentUser.favoriteReviews, { id })
          store.writeQuery({ query: READ_USER_FAVORITES, data })
        }
      })
  })
})

export default compose(
  withFavoriteMutation,
  withDeleteMutation
)(Review)
