import { gql, useMutation } from "@apollo/client";
import {
  Avatar,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@material-ui/core";
import {
  Favorite,
  FavoriteBorder,
  MoreVert,
  Star,
  StarBorder,
} from "@material-ui/icons";
import { formatDistanceToNow } from "date-fns";
import times from "lodash/times";
import React, { useState } from "react";

const FAVORITE_REVIEW_MUTATION = gql`
  mutation FavoriteReview($id: ObjID!, $favorite: Boolean!) {
    favoriteReview(id: $id, favorite: $favorite) {
      id
      favorited
    }
  }
`;

const READ_USER_FAVORITES = gql`
  query ReadUserFavorites {
    currentUser {
      id
      favoriteReviews {
        id
      }
    }
  }
`;

const FavoriteButton = ({ id, favorited }) => {
  const [favorite] = useMutation(FAVORITE_REVIEW_MUTATION, {
    optimisticResponse: {
      favoriteReview: {
        __typename: "Review",
        id,
        favorited: !favorited,
      },
    },
    update: (cache, { data: { favoriteReview } }) => {
      const { currentUser } = cache.readQuery({ query: READ_USER_FAVORITES });
      let newUser;

      if (favoriteReview.favorited) {
        newUser = {
          ...currentUser,
          favoriteReviews: [
            ...currentUser.favoriteReviews,
            { id, __typename: "Review" },
          ],
        };
      } else {
        newUser = {
          ...currentUser,
          favoriteReviews: currentUser.favoriteReviews.filter(
            (review) => review.id !== id
          ),
        };
      }

      cache.writeQuery({
        query: READ_USER_FAVORITES,
        data: { currentUser: newUser },
      });
    },
  });

  function toggleFavorite() {
    favorite({ variables: { id, favorite: !favorited } });
  }

  return (
    <IconButton onClick={toggleFavorite}>
      {favorited ? <Favorite /> : <FavoriteBorder />}
    </IconButton>
  );
};

const StarRating = ({ rating }) => {
  return (
    <div>
      {times(rating, (i) => (
        <Star key={i} />
      ))}
      {times(5 - rating, (i) => (
        <StarBorder key={i} />
      ))}
    </div>
  );
};

export const Review = ({ review }) => {
  const { text, stars, createdAt, favorited, author } = review;
  const [anchorEl, setAnchorEl] = useState(null);

  function openMenu(event) {
    setAnchorEl(event.currentTarget);
  }

  function closeMenu() {
    setAnchorEl(null);
  }

  function editReview() {
    closeMenu();
  }

  function deleteReview() {
    closeMenu();
  }

  const LinkToProfile = ({ children }) => {
    return (
      <a
        href={`https://github.com/${author.username}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  };

  return (
    <div>
      <Card className="Review">
        <CardHeader
          avatar={
            <LinkToProfile>
              <Avatar alt={author.name} src={author.photo}></Avatar>
            </LinkToProfile>
          }
          action={
            <IconButton onClick={openMenu}>
              <MoreVert />
            </IconButton>
          }
          title={<LinkToProfile>{author.name}</LinkToProfile>}
          subheader={stars && <StarRating rating={stars} />}
        ></CardHeader>
        <CardContent>
          <Typography component="p">{text}</Typography>
        </CardContent>
        <CardActions>
          <Typography className="Review-created">
            {formatDistanceToNow(createdAt)} ago
          </Typography>
          <div className="Review-spacer" />
          <FavoriteButton {...review} />
        </CardActions>
      </Card>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        <MenuItem onClick={editReview}>Edit</MenuItem>
        <MenuItem onClick={deleteReview}>Delete</MenuItem>
      </Menu>
    </div>
  );
};
