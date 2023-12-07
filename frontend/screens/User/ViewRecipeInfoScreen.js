import React, { useState, useEffect, useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  StatusBar,
  Button,
  Alert,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import { Context } from "../../store/context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";

export default function ViewRecipeInfoScreen({ route }) {
  const navigation = useNavigation();

  const [recipe, setRecipe] = useState(route.params.recipe);
  //   const { recipe } = route.params;
  const [username, setUsername] = useState("");
  const [currentUser, setCurrentUser] = useContext(Context);

  const [isCreator, setIsCreator] = useState(false);
  const [userReview, setUserReview] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editReview, setEditReview] = useState("");
  const [editRating, setEditRating] = useState(0);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [submittedReviews, setSubmittedReviews] = useState([]);
  const [currentUserReviews, setCurrentUserReviews] = useState([]); // Initialize currentUserReviews

  const fetchRecipeDetails = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_IP}/recipe/getRecipeId/${recipe._id}`
      );
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      const updatedRecipe = await response.json();
      setRecipe(updatedRecipe);
      // Fetch username or other necessary data here
    } catch (error) {
      console.error("Error fetching recipe data:", error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchRecipeDetails();
    }, [])
  );
  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_IP}/user/getUserById/${recipe.submitted_by}`
        );
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }
        const user = await response.json();
        setUsername(user.username); // Update the state
        setIsCreator(currentUser._id === recipe.submitted_by); // Check if the current user is the recipe creator
      } catch (error) {
        // console.error("Error fetching user data:", error);
        setUsername("Unknown User"); // Fallback username
      }
    };

    if (recipe && recipe.submitted_by) {
      fetchUsername();
    }
  }, [recipe, currentUser._id]);

  // new
  // When the edit icon is clicked
  const handleEditClick = (reviewId, currentReview, currentRating) => {
    setEditingReviewId(reviewId);
    setEditReview(currentReview);
    setEditRating(currentRating);
    setEditModalVisible(true);
  };

  // Submit the edited review
  const submitEditedReview = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_IP}/recipe/editRating/${recipe._id}`,
        {
          method: "PATCH", // Or POST, depending on your backend setup
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipeId: recipe._id,
            reviewId: editingReviewId,
            newReview: editReview,
            newRating: Number(editRating),
          }),
        }
      );

      if (response.ok) {
        const updatedRecipe = await response.json();

        // Update the local state with the new recipe data
        route.params.recipe = updatedRecipe;

        // Update the state for reviews with usernames
        const reviewsWithUsernames = await Promise.all(
          updatedRecipe.reviewsAndRatings.map(async (review) => {
            const username = await fetchUsernameById(review.name);
            return { ...review, username };
          })
        );

        const currentUserReviews = reviewsWithUsernames
          .filter((review) => review.name === currentUser._id)
          .reverse();
        const otherUserReviews = reviewsWithUsernames
          .filter((review) => review.name !== currentUser._id)
          .reverse();

        setSubmittedReviews(otherUserReviews);
        setCurrentUserReviews(currentUserReviews);

        Alert.alert("Success", "Your review has been updated.");
      } else {
        Alert.alert("Error", "Failed to update the review.");
      }
    } catch (error) {
      console.error("Error updating review:", error);
      Alert.alert("Error", "An error occurred while updating the review.");
    }

    // Close the edit modal
    setEditModalVisible(false);
  };

  const confirmDeleteReview = (reviewId) => {
    Alert.alert(
      "Delete Review",
      "Are you sure you want to delete your review?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: () => deleteReview(reviewId) },
      ],
      { cancelable: false }
    );
  };

  const deleteReview = async (reviewId) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_IP}/recipe/deleteRating/${recipe._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reviewId }),
        }
      );

      if (response.ok) {
        // Update the reviews list
        const updatedReviews = submittedReviews.filter(
          (review) => review._id !== reviewId
        );
        setSubmittedReviews(updatedReviews);

        // Recalculate average rating and total ratings
        const totalRatings = updatedReviews.length;
        const sumRatings = updatedReviews.reduce(
          (acc, curr) => acc + curr.ratings,
          0
        );
        const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

        // Update the state
        route.params.recipe.averageRating = averageRating;
        route.params.recipe.totalRatings = totalRatings;

        // Reflect these changes in your component's state
        setCurrentUserReviews([]);
        // Optionally call fetchReviews() if you need to update other parts of the state

        Alert.alert(
          "Review Deleted",
          "Your review has been successfully deleted."
        );
      } else {
        Alert.alert("Error", "Failed to delete the review.");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      Alert.alert("Error", "An error occurred while deleting the review.");
    }
  };

  const submitReviewAndRating = async () => {
    if (!userReview.trim() || userRating === 0) {
      Alert.alert("Error", "Please enter both review and rating.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_IP}/recipe/ratings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: recipe._id,
            name: currentUser._id,
            reviews: userReview,
            ratings: Number(userRating),
          }),
        }
      );

      if (response.ok) {
        // Assuming you get the updated recipe data in the response
        const updatedRecipe = await response.json();

        // Update the local state with the new recipe data
        route.params.recipe = updatedRecipe;

        // Update the state for reviews with usernames
        const reviewsWithUsernames = await Promise.all(
          updatedRecipe.reviewsAndRatings.map(async (review) => {
            const username = await fetchUsernameById(review.name);
            return { ...review, username };
          })
        );

        const currentUserReviews = reviewsWithUsernames
          .filter((review) => review.name === currentUser._id)
          .reverse();
        const otherUserReviews = reviewsWithUsernames
          .filter((review) => review.name !== currentUser._id)
          .reverse();

        setSubmittedReviews(otherUserReviews);
        setCurrentUserReviews(currentUserReviews);

        // Reset form fields
        setUserReview("");
        setUserRating("");

        Alert.alert("Success", "Your review has been submitted.");
      } else {
        Alert.alert("Error", "Failed to submit the review.");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert("Error", "An error occurred while submitting the review.");
    }
  };

  // Function to fetch username based on UserId
  const fetchUsernameById = async (userId) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_IP}/user/getUserById/${userId}`
      );
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      const userData = await response.json();
      return userData.username || "Deleted User";
    } catch (error) {
      // console.error("Error fetching user data:", error);
      return "Deleted User";
    }
  };

  // Function to fetch all reviews and update the state with usernames
  const fetchRecipeDataAndUpdateState = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_IP}/recipe/getRecipeId/${recipe._id}`
      );
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      const data = await response.json();

      // Update the route params with the new recipe data
      route.params.recipe = data;

      // Update the state for reviews with usernames
      const reviewsWithUsernames = await Promise.all(
        data.reviewsAndRatings.map(async (review) => {
          const username = await fetchUsernameById(review.name);
          return { ...review, username };
        })
      );

      const currentUserReviews = reviewsWithUsernames
        .filter((review) => review.name === currentUser._id)
        .reverse();
      const otherUserReviews = reviewsWithUsernames
        .filter((review) => review.name !== currentUser._id)
        .reverse();

      setSubmittedReviews(otherUserReviews);
      setCurrentUserReviews(currentUserReviews);
    } catch (error) {
      console.error("Error fetching recipe details:", error);
    }
  };

  // Use the function in useEffect or useFocusEffect
  useEffect(() => {
    fetchRecipeDataAndUpdateState();
  }, [recipe._id, currentUser._id]);

  const Star = ({ filled, partiallyFilled }) => {
    return (
      <View style={{ position: "relative" }}>
        <Icon name="star-outline" color="grey" size={24} />
        {(filled || partiallyFilled > 0) && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: partiallyFilled ? `${partiallyFilled * 100}%` : "100%",
              overflow: "hidden",
            }}
          >
            <Icon name="star" color="orange" size={24} />
          </View>
        )}
      </View>
    );
  };

  // Function to handle changes in star rating
  const handleRatingChange = (newRating) => {
    setUserRating(newRating);
  };

  const Rating = ({ rating }) => {
    const fullStars = Math.floor(rating);
    const partialStar = rating % 1;
    const emptyStars = 5 - fullStars - (partialStar > 0 ? 1 : 0);

    return (
      <View style={{ flexDirection: "row" }}>
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full_${i}`} filled />
        ))}
        {partialStar > 0 && (
          <Star key="partial" partiallyFilled={partialStar} />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty_${i}`} />
        ))}
      </View>
    );
  };

  // StarRatingInput component (centralized)
  const StarRatingInput = ({ maxRating = 5, rating, onRatingChange }) => {
    return (
      <View style={{ flexDirection: "row", justifyContent: "center" }}>
        {/* Centering the stars */}
        {[...Array(maxRating)].map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onRatingChange(index + 1)}
          >
            <Icon
              name={index < rating ? "star" : "star-outline"}
              color="orange"
              size={30}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  //
  const handleEditPress = () => {
    navigation.navigate("Edit Recipe", { recipe });
  };

  const handleDeletePress = () => {
    Alert.alert(
      "Delete Recipe",
      "Are you sure you want to delete this recipe?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => deleteRecipe(),
        },
      ]
    );
  };

  const deleteRecipe = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_IP}/recipe/deleteRecipe/${recipe._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }

      // Navigate back or update the state after successful deletion
      Alert.alert("Success", "Recipe deleted successfully");
      navigation.navigate("View Recipe");
    } catch (error) {
      console.error("Error deleting recipe:", error);
      Alert.alert("Error", "Failed to delete recipe");
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View>
        <View style={styles.imageContainer}>
          <Image source={{ uri: recipe.image }} style={styles.image} />
        </View>
        <Text style={styles.title}>{recipe.name}</Text>
        <View style={styles.ratingContainer}>
          <Rating rating={recipe.averageRating} />
          <Text style={styles.ratingText}>
            {recipe.averageRating.toFixed(1)}
          </Text>
        </View>
        <View style={styles.ratingContainer}>
          <Icon name="person" size={24} color="#333333" />
          <Text style={{ marginLeft: 8 }}>
            {recipe.totalRatings} people rated
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleEditPress}>
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={handleDeletePress}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mainBox}>
          <View style={styles.section}>
            <Text style={styles.subTitle}>Created by: </Text>
            <Text>{username}</Text>
          </View>

          {/* Display a warning based on user's food restrictions, if any */}
          {currentUser.foodRestrictions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.subTitle}>Disclaimer: </Text>
              <Text>
                Based on your medical history, it is recommended to minimize or
                abstain from using{" "}
                <Text style={{ color: "red", fontWeight: "bold" }}>
                  {currentUser.foodRestrictions.join(", ")}
                </Text>{" "}
                when preparing the recipe. {"\n"}
              </Text>
            </View>
          )}

          {/* Ingredients List */}
          <View style={styles.section}>
            <Text style={styles.subTitle}>Ingredients: </Text>
            {recipe.ingredients.map((ingredient, index) => (
              <Text key={index}>• {ingredient}</Text>
            ))}
          </View>

          {/* Cooking Instructions */}
          <View style={styles.section}>
            <Text style={styles.subTitle}>Instructions: </Text>
            {recipe.instructions.map((instruction, index) => (
              <Text key={index}>
                Step {index + 1}: {instruction} {"\n"}
              </Text>
            ))}
          </View>

          {/* Display calories if available */}
          <Text style={styles.subTitle}>Calories: </Text>
          <Text>{recipe.calories || "Not specified"}</Text>
        </View>
        {/* <AddRatingsScreen /> */}
        {currentUserReviews.length === 0 ||
          (isCreator && <Text style={styles.title}>Recipe Review </Text>)}

        {/* Only show review submission form if the user hasn't submitted a review yet and is not the creator */}

        {currentUserReviews.length === 0 && !isCreator && (
          <View style={styles.mainBox}>
            <View style={styles.section}>
              <TextInput
                style={styles.input}
                placeholder="Enter your review"
                value={userReview}
                onChangeText={setUserReview}
                multiline
              />
              <StarRatingInput
                rating={userRating}
                onRatingChange={handleRatingChange}
              />
              <Button title="Submit Review" onPress={submitReviewAndRating} />
            </View>
          </View>
        )}

        {/* "Your Review" section */}

        {isCreator ? (
          <View>
            <Text style={styles.title}>Your Review</Text>

            <View style={styles.mainBox}>
              <Text style={styles.noReviewsText}>
                Recipe creator cannot add their own review.
              </Text>
            </View>
          </View>
        ) : (
          currentUserReviews.length > 0 && (
            <View>
              <Text style={styles.title}>
                Your Review{" "}
                <TouchableOpacity
                  onPress={() =>
                    handleEditClick(
                      currentUserReviews[0]._id,
                      currentUserReviews[0].reviews,
                      currentUserReviews[0].ratings
                    )
                  }
                  style={styles.editIcon}
                >
                  <Icon name="edit" size={24} color="#007BFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => confirmDeleteReview(currentUserReviews[0]._id)}
                  style={styles.deleteIcon}
                >
                  <Icon name="delete" size={24} color="#FF6347" />
                </TouchableOpacity>
              </Text>
              {currentUserReviews.map((review, index) => (
                <View key={index} style={styles.mainBox}>
                  <View style={styles.section}>
                    <Text style={styles.reviewLabel}>Name:</Text>
                    <Text style={styles.reviewContent}>
                      {review.username || "Deleted User"}
                    </Text>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.reviewLabel}>Review:</Text>
                    <Text style={styles.reviewContent}>{review.reviews}</Text>
                  </View>

                  <Text style={styles.reviewLabel}>Rating:</Text>
                  <Rating rating={review.ratings} />
                </View>
              ))}
            </View>
          )
        )}

        {/* "Community Reviews" section */}
        <Text style={styles.title}>Community Reviews</Text>
        {submittedReviews.length > 0 ? (
          // <View style={styles.mainBox}>
          <View style={styles.submittedReviewsContainer}>
            {submittedReviews.map((review, index) => (
              <View key={index} style={styles.mainBox}>
                <View style={styles.section}>
                  <Text style={styles.reviewLabel}>Name:</Text>
                  <Text style={styles.reviewContent}>
                    {review.username || "Deleted User"}
                  </Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.reviewLabel}>Review:</Text>
                  <Text style={styles.reviewContent}>{review.reviews}</Text>
                </View>

                <Text style={styles.reviewLabel}>Rating:</Text>
                <Rating rating={review.ratings} />
              </View>
            ))}
          </View>
        ) : (
          // </View>
          <View style={styles.mainBox}>
            <Text style={styles.noReviewsText}>No reviews yet</Text>
          </View>
        )}

        <StatusBar style="auto" />
      </View>
      {/* Edit Review Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TextInput
              style={styles.input}
              placeholder="Edit your review"
              value={editReview}
              onChangeText={setEditReview}
              multiline
            />
            {/* Star rating input for editing rating */}
            <StarRatingInput
              rating={editRating}
              onRatingChange={(newRating) => setEditRating(newRating)}
            />
            {/* Save Changes Button */}
            <TouchableOpacity
              style={styles.secondButton}
              onPress={submitEditedReview}
            >
              <Text style={styles.submitButtonText}>Save Changes</Text>
            </TouchableOpacity>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={styles.submitButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  reasonsContainer: {
    justifyContent: "flex-start",
  },
  reasonButton: {
    padding: 10,
    marginBottom: 10, // Space between buttons
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  activeReasonButton: {
    backgroundColor: "#e0e0e0", // Example background color for active button
  },
  reasonButtonText: {
    color: "black",
    fontSize: 16,
    // Other text styling as needed
  },
  activeReasonButtonText: {
    fontWeight: "bold", // Bold text for active button
  },
  icon: {
    marginRight: 16,
  },
  menuItem: {
    marginTop: 15,
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#dddddd",
  },
  menuItemText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 16,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    alignSelf: "center", // Center the modal horizontally
    marginTop: "50%", // Adjust as needed to center the modal vertically
  },

  submitButton: {
    backgroundColor: "red",
    padding: 8,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    marginBottom: 10,
  },
  secondButton: {
    backgroundColor: "blue",
    padding: 8,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    marginBottom: 10,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    width: "100%",
    marginBottom: 10,
  },
  reportButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    width: "80%",
    marginBottom: 20,
  },
  reportButtonText: {
    color: "white",
  },
  container: {
    flex: 1,
    backgroundColor: "#FCFCD3",
    padding: 20,

    //alignItems: "center",
  },
  //style for the image
  imageContainer: {
    flex: 1,
    justifyContent: "center", // Center the image vertically
    alignItems: "center", // Center the image horizontally
    padding: 10,
  },
  image: {
    flex: 1,
    width: 310,
    height: 310,
    resizeMode: "contain",
    borderRadius: 20,
  },
  title: {
    color: "#333333",
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
  },
  subTitle: {
    color: "black",
    fontSize: 20,
    fontWeight: "bold",
  },
  mainBox: {
    borderWidth: 2,
    borderColor: "#CCCCCC",
    borderRadius: 10,
    padding: 10,
    marginBottom: 30,
  },
  section: {
    borderBottomWidth: 1,
    borderBottomColor: "#CCCCCC",
    paddingBottom: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
    paddingBottom: 10,
  },
  boldText: {
    fontWeight: "bold",
  },
  // submittedReviewsContainer: {
  //   marginTop: 20,
  // },
  reviewItem: {
    // backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  reviewLabel: {
    fontWeight: "bold",
    color: "#333",
    marginTop: 5,
  },
  reviewContent: {
    color: "#333",
    marginBottom: 5,
  },
  reviewText: {
    fontSize: 14,
  },
  noReviewsText: {
    color: "#333",
    textAlign: "center",
    marginTop: 10,
    fontSize: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },
  ratingText: {
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 8, // Reduced padding
    borderRadius: 5,
    width: 90, // Reduced width
    alignItems: "center",
    marginHorizontal: 5, // Added horizontal margin for spacing
    elevation: 2, // Added elevation for subtle shadow (Android)
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 }, // Shadow for iOS
    shadowOpacity: 0.2, // Shadow for iOS
    shadowRadius: 2, // Shadow for iOS
  },
  deleteButton: {
    backgroundColor: "#FF4136",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },

  contentContainer: {
    paddingBottom: 30,
  },
});
