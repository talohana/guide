import { Fab, Modal } from "@material-ui/core";
import { Add, Favorite } from "@material-ui/icons";
import get from "lodash/get";
import React, { useState } from "react";
import { useUser } from "../lib/useUser";
import { ReviewForm } from "./ReviewForm";
import { ReviewList } from "./ReviewList";

export const Reviews = () => {
  const [addingReview, setAddingReview] = useState(false);

  const { user } = useUser();
  const favoriteCount = get(user, "favoriteReviews.length");

  return (
    <main className="Reviews mui-fixed">
      <div className="Reviews-header-wrapper">
        <header className="Reviews-header">
          {favoriteCount ? (
            <div className="Reviews-favorite-count">
              <Favorite />
              {favoriteCount}
            </div>
          ) : null}
          <h1>Reviews</h1>
        </header>
      </div>

      <ReviewList />

      {user && (
        <div>
          <Fab
            onClick={() => setAddingReview(true)}
            color="primary"
            className="Reviews-add"
          >
            <Add />
          </Fab>

          <Modal open={addingReview} onClose={() => setAddingReview(false)}>
            <ReviewForm ReviewForm done={() => setAddingReview(false)} />
          </Modal>
        </div>
      )}
    </main>
  );
};
