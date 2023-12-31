import React, { useState, useEffect } from "react";
import { ButtonGroup, Card } from "react-bootstrap";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ShareModal from "./ShareModal";
import { IoArrowUpCircle, IoArrowDownCircle } from "react-icons/io5";

dayjs.extend(relativeTime);

interface Post {
  id: number;
  comment?: string;
  ownerId: number;
  photoURL?: string;
  description?: string;
  createdAt: string;
  upvotes: number;
}

interface PostCardProps {
  post: Post;
  userId: number;
}

const PostCard: React.FC<PostCardProps> = ({ post, userId }) => {
  const [owner, setOwner] = useState("");
  const [commentVotingStatus, setCommentVotingStatus] = useState<
    "upvoted" | "downvoted" | "none"
  >("none");

  const getOwner = async () => {
    try {
      const { data } = await axios.get(`api/home/post/${post.ownerId}`);
      setOwner(data.firstName + " " + data.lastName);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpvote = async (type: string) => {
    try {
      await axios.post(
        `/api/feed/${
          type === "comment"
            ? `upvote-comment/${userId}/${post.id}`
            : `upvote-photo/${userId}/${post.id}`
        }`
      );

      if (commentVotingStatus !== "upvoted") {
        setCommentVotingStatus("upvoted");
        // toast("🎭Upvoted successfully!🎭", {
        //   position: "top-right",
        //   autoClose: 5000,
        //   hideProgressBar: false,
        //   closeOnClick: true,
        //   pauseOnHover: true,
        //   draggable: true,
        //   progress: undefined,
        //   theme: "light",
        // });
      }
    } catch (err) {
      toast.warning("You've already upvoted this post!");
    }
  };

  const handleDownvote = async (type: string) => {
    try {
      await axios.post(
        `/api/feed/${
          type === "comment"
            ? `downvote-comment/${userId}/${post.id}`
            : `downvote-photo/${userId}/${post.id}`
        }`
      );

      if (commentVotingStatus !== "downvoted") {
        setCommentVotingStatus("downvoted");
        // toast.error("Downvoted!", {
        //   position: "top-right",
        //   autoClose: 5000,
        //   hideProgressBar: false,
        //   closeOnClick: true,
        //   pauseOnHover: true,
        //   draggable: true,
        //   progress: undefined,
        //   theme: "light",
        // });

        if (post.upvotes - 1 <= -5) {
          toast.error("Post deleted due to too many downvotes!");
        }
      }
    } catch (err) {
      toast.warning("You've already downvoted this post!");
    }
  };

  useEffect(() => {
    getOwner();
  }, []);

  return (
    <>
      <Card>
        {post.comment ? (
          <Card.Body>
            <Card.Text>
              {post.comment} - {owner}:{" "}
              {dayjs(post.createdAt.toString()).fromNow()}
            </Card.Text>
            <ButtonGroup style={{ display: 'flex', flexDirection: 'row'}}>
            <button
              style={{
                border: "none",
                cursor: "pointer",
                outline: "none",
                boxShadow: "none",
                background: "transparent",
              }}
              onClick={() => handleUpvote("comment")}
              disabled={commentVotingStatus === "upvoted"}
            >
              <IoArrowUpCircle
                style={{
                  color: commentVotingStatus === "upvoted" ? "green" : "black",
                  fontSize: "30px",
                }}
              />
            </button>
            <span style={{ margin: "0 5px" }}>{post.upvotes}</span>
            <button
              style={{
                border: "none",
                cursor: "pointer",
                outline: "none",
                boxShadow: "none",
                background: "transparent",
              }}
              onClick={() => handleDownvote("comment")}
              disabled={commentVotingStatus === "downvoted"}
            >
              <IoArrowDownCircle
                style={{
                  color: commentVotingStatus === "downvoted" ? "red" : "black",
                  fontSize: "30px",
                }}
              />
            </button>
            <ShareModal postId={post.id} userId={userId} postType={"comment"}/>
            </ButtonGroup>
          </Card.Body>
        ) : (
          <Card.Body>
            <Card.Img variant="top" src={post.photoURL} />
            <Card.Text>
              {post.description} - {owner}:{" "}
              {dayjs(post.createdAt.toString()).fromNow()}
            </Card.Text>
            <ButtonGroup style={{ display: 'flex', flexDirection: 'row'}}>

            <button
              style={{
                border: "none",
                cursor: "pointer",
                outline: "none",
                boxShadow: "none",
                background: "transparent",
              }}
              onClick={() => handleUpvote("photo")}
              disabled={commentVotingStatus === "upvoted"}
            >
              <IoArrowUpCircle
                style={{
                  color: commentVotingStatus === "upvoted" ? "green" : "black",
                  fontSize: "30px",
                }}
              />
            </button>
            <span style={{ margin: "0 5px" }}>{post.upvotes}</span>
            <button
              style={{
                border: "none",
                cursor: "pointer",
                outline: "none",
                boxShadow: "none",
                background: "transparent",
              }}
              onClick={() => handleDownvote("photo")}
              disabled={commentVotingStatus === "downvoted"}
            >
              <IoArrowDownCircle
                style={{
                  color: commentVotingStatus === "downvoted" ? "red" : "black",
                  fontSize: "30px",
                }}
              />
            </button>
            <ShareModal postId={post.id} userId={userId} postType={"photo"} />
          </ButtonGroup>
          </Card.Body>
        )}
      </Card>

      {/* Toast containers */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};

export default PostCard;
