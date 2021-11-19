import { Fab, FormControl, MenuItem, Modal, Select } from "@material-ui/core";
import { Add, Favorite } from "@material-ui/icons";
import get from "lodash/get";
import React, { useState } from "react";
import { useUser } from "../lib/useUser";
import { ReviewCreatedNotification } from "./ReviewCreatedNotification";
import { ReviewForm } from "./ReviewForm";
import { ReviewList } from "./ReviewList";

export const Reviews = () => {
  const [filters, setFilters] = useState({
    orderBy: "createdAt_DESC",
    minStars: "1",
    minSentences: "1",
  });
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
          <FormControl>
            <Select
              value={filters.orderBy}
              onChange={(e) =>
                setFilters((prevFilters) => ({
                  ...prevFilters,
                  orderBy: e.target.value,
                }))
              }
              displayEmpty
            >
              <MenuItem value="createdAt_DESC">Newest</MenuItem>
              <MenuItem value="createdAt_ASC">Oldest</MenuItem>
            </Select>

            <Select
              value={filters.minStars}
              onChange={(e) =>
                setFilters((prevFilters) => ({
                  ...prevFilters,
                  minStars: e.target.value,
                }))
              }
              displayEmpty
            >
              <MenuItem value="1">1+ stars</MenuItem>
              <MenuItem value="2">2+ stars</MenuItem>
              <MenuItem value="3">3+ stars</MenuItem>
              <MenuItem value="4">4+ stars</MenuItem>
              <MenuItem value="5">5+ stars</MenuItem>
            </Select>

            <Select
              value={filters.minSentences}
              onChange={(e) =>
                setFilters((prevFilters) => ({
                  ...prevFilters,
                  minSentences: e.target.value,
                }))
              }
              displayEmpty
            >
              <MenuItem value="1">1+ sentences</MenuItem>
              <MenuItem value="2">2+ sentences</MenuItem>
              <MenuItem value="3">3+ sentences</MenuItem>
              <MenuItem value="4">4+ sentences</MenuItem>
              <MenuItem value="5">5+ sentences</MenuItem>
            </Select>
          </FormControl>
        </header>
      </div>

      <ReviewList {...filters} />
      <ReviewCreatedNotification />

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
