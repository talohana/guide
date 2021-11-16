import { gql, useMutation } from "@apollo/client";
import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Modal,
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
import find from "lodash/find";
import times from "lodash/times";
import React, { useState } from "react";
import { useUser } from "../lib/useUser";
import { ReviewForm } from "./ReviewForm";

const FAVORITE_REVIEW_MUTATION = gql`
  mutation FavoriteReview($id: ObjID!, $favorite: Boolean!) {
    favoriteReview(id: $id, favorite: $favorite) {
      id
      favorited
    }
  }
`;

const REMOVE_REVIEW_MUTATION = gql`
  mutation RemoveReview($id: ObjID!) {
    removeReview(id: $id)
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
      cache.modify({
        fields: {
          currentUser(currentUserRef) {
            cache.modify({
              id: currentUserRef.__ref,
              fields: {
                favoriteReviews: (reviewRefs, { readField }) => {
                  return favoriteReview.favorited
                    ? [...reviewRefs, { __ref: `Review:${id}` }]
                    : reviewRefs.filter(
                        (reviewRef) => readField("id", reviewRef) !== id
                      );
                },
              },
            });

            return currentUserRef;
          },
        },
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
  const { id } = review;
  const { user } = useUser();

  // eslint-disable-next-line no-unused-vars
  const { text, stars, createdAt, favorited, author } = review;
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [removeReview] = useMutation(REMOVE_REVIEW_MUTATION, {
    update: (cache) => {
      cache.evict({ id: cache.identify(review) });
    },
  });

  function openMenu(event) {
    setAnchorEl(event.currentTarget);
  }

  function closeMenu() {
    setAnchorEl(null);
  }

  function deleteReview() {
    closeMenu();
    removeReview(
      { variables: { id } },
      { optimisticResponse: { removeReview: true } }
    ).catch((e) => {
      if (find(e.graphQLErrors, { message: "unauthorized" })) {
        alert("👮🏻‍♀️✋🏻 You can only delete your own reviews!");
      }
    });
    setDeleteConfirmationOpen(false);
  }

  function editReview() {
    closeMenu();
    setEditing(true);
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
            user && (
              <IconButton onClick={openMenu}>
                <MoreVert />
              </IconButton>
            )
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
          {user && <FavoriteButton {...review} />}
        </CardActions>
      </Card>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        <MenuItem onClick={editReview}>Edit</MenuItem>
        <MenuItem
          onClick={() => {
            closeMenu();
            setDeleteConfirmationOpen(true);
          }}
        >
          Delete
        </MenuItem>
      </Menu>
      <Dialog
        open={deleteConfirmationOpen}
        onClose={() => setDeleteConfirmationOpen(false)}
      >
        <DialogTitle>Delete Review?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            A better UX is probably just letting you single-click delete with an
            undo toast, but that's harder to code right{" "}
            <span role="img" aria-label="grinning face">
              😄
            </span>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmationOpen(false)}>
            Cancel
          </Button>
          <Button onClick={deleteReview} color="primary" autoFocus>
            Sudo Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Modal open={editing} onClose={() => setEditing(false)}>
        <ReviewForm done={() => setEditing(false)} review={review} />
      </Modal>
    </div>
  );
};
