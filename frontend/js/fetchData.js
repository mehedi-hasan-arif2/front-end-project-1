const showLoggedUsername = () => {
    const userNameElement = document.getElementById("logged-username");
    let user = localStorage.getItem("loggedInuser");
    if (user) {
        user = JSON.parse(user);
        userNameElement.innerHTML = `<i class="fa-solid fa-camera"></i> ${user.userName}`;
    }
};

const checkLoggedInUser = () => {
    let user = localStorage.getItem("loggedInuser");
    if (!user) {
        window.location.href = "/index.html";
    }
};

const logOut = () => {
    localStorage.clear();
    window.location.href = "/index.html";
};

const fetchAllPosts = async () => {
    try {
        const res = await fetch("http://localhost:5000/getAllPosts");
        const data = await res.json();
        showAllPosts(data);
    } catch (err) {
        console.log("Error fetching data from server", err);
    }
};

const showAllPosts = (allPosts) => {
    const postContainer = document.getElementById('post-container');
    postContainer.innerHTML = "";
    let loggedUser = JSON.parse(localStorage.getItem("loggedInuser"));

    allPosts.forEach(async (post) => {
        const postDiv = document.createElement('div');
        postDiv.classList.add('post');

        postDiv.innerHTML = `
        <div class="post-header">   
            <div class="post-user-image">
                <img src="${post.postedUserImage}" />
            </div>
            <div class="post-username-time">
                <p class="post-username">${post.postedUserName}</p>
                <div class="posted-time">
                    <span>${timeDifference(`${post.postedTime}`)}</span> ago
                </div>
            </div>
        </div>
        <div class="post-text">
            <p class="post-text-content">${post.postText}</p>
        </div>
        <div class="post-image">
            <img src="${post.postImageUrl}" alt="post-image" />
        </div>
        `;

        postContainer.appendChild(postDiv);

        // --- Post Actions (Edit/Delete) ---
        const postActionsDiv = document.createElement('div');
        postActionsDiv.classList.add('post-actions');
        postActionsDiv.innerHTML = `
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
        `;
        if (loggedUser.userId !== post.postedUserId) {
            postActionsDiv.style.display = "none";
        }
        postDiv.appendChild(postActionsDiv);

        // --- Comments Section ---
        const commentsHolderDiv = document.createElement('div');
        commentsHolderDiv.classList.add('comments-holder');
        postDiv.appendChild(commentsHolderDiv);

        let postComments = await fetchAllCommentsOfAPost(post.postId);
        postComments.forEach((comment) => {
            let commentClass = "comment";
            if (loggedUser.userId === comment.commentedUserId) {
                commentClass += " my-comment";
            }

            let isCommentOwner = loggedUser.userId === comment.commentedUserId;
            let isPostOwner = loggedUser.userId === post.postedUserId;

            let actionButtons = "";
            if (isCommentOwner) {
                actionButtons = `
                    <span class="comment-actions">
                        <i class="fa-solid fa-pen-to-square" onclick="handleEditComment(${comment.commentId}, '${comment.commentText}')"></i>
                        <i class="fa-solid fa-trash" onclick="handleDeleteComment(${comment.commentId}, ${post.postedUserId})"></i>
                    </span>`;
            } else if (isPostOwner) {
                actionButtons = `
                    <span class="comment-actions">
                        <i class="fa-solid fa-trash" onclick="handleDeleteComment(${comment.commentId}, ${post.postedUserId})"></i>
                    </span>`;
            }

            const commentDiv = document.createElement('div');
            commentDiv.className = commentClass;
            
            const commentTimeAgo = timeDifference(comment.commentTime);

            commentDiv.innerHTML = `
                <div class="comment-user-image">
                    <img src="${comment.commentedUserImage}">
                </div>
                <div class="comment-text-container">
                    <h4>
                        ${comment.commentedUsername} 
                        <span class="comment-time">${commentTimeAgo} ago</span> 
                        ${actionButtons}
                    </h4>
                    <p class="comment-text">${comment.commentText}</p>
                </div>
            `;
            commentsHolderDiv.appendChild(commentDiv);
        });

        // --- Add New Comment Input ---
        const addNewCommentDiv = document.createElement("div");
        addNewCommentDiv.classList.add("postComment-holder");
        addNewCommentDiv.innerHTML = `
            <div class="post-comment-input-field-holder">
                <input type="text" placeholder="Post your comment" class="postComment-input-field" id="postComment-input-for-postID-${post.postId}" />
            </div>
            <button onClick="handlePostComment(${post.postId})" class="postComment-btn">Comment</button>
        `;
        postDiv.appendChild(addNewCommentDiv);

        // --- Event Listeners for Post Delete/Edit ---
        postActionsDiv.querySelector('.delete-btn').addEventListener('click', async () => {
            if (!confirm("Delete this post?")) return;
            await fetch(`http://localhost:5000/deletePost/${post.postId}/${loggedUser.userId}`, { method: "DELETE" });
            location.reload();
        });

        postActionsDiv.querySelector('.edit-btn').addEventListener('click', async () => {
            const newText = prompt("Edit text:", post.postText);
            const newImage = prompt("Edit image URL:", post.postImageUrl);
            if (!newText) return;
            await fetch("http://localhost:5000/editPost", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postId: post.postId, postText: newText, postImageUrl: newImage, userId: loggedUser.userId })
            });
            location.reload();
        });
    });
};

const handlePostComment = async (postId) => {
    let user = JSON.parse(localStorage.getItem("loggedInuser"));
    const commentText = document.getElementById(`postComment-input-for-postID-${postId}`).value.trim();
    if (!commentText) return alert("Comment cannot be empty");

    let now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    
    const commmentObject = {
        commentOfPostId: postId,
        commentedUserId: user.userId,
        commentText: commentText,
        commentTime: now.toISOString(),
    };

    await fetch('http://localhost:5000/postComment', {
        method: 'POST',
        headers: { "content-type": "application/json" },
        body: JSON.stringify(commmentObject),
    });
    location.reload();
};

const fetchAllCommentsOfAPost = async (postId) => {
    try {
        const res = await fetch(`http://localhost:5000/getAllComments/${postId}`);
        return await res.json();
    } catch (err) {
        return [];
    }
};

const handleAddNewPost = async () => {
    let user = JSON.parse(localStorage.getItem("loggedInuser"));
    const postText = document.getElementById('newPost-text').value.trim();
    const postImageUrl = document.getElementById('newPost-image').value;
    if (!postText) return alert("Post text is empty");

    let now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

    await fetch('http://localhost:5000/addNewPost', {
        method: 'POST',
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ postedUserId: user.userId, postedTime: now.toISOString(), postText, postImageUrl }),
    });
    location.reload();
};

const changeProfileImage = async () => {
    const newImageUrl = prompt("New Profile Image URL:");
    if (!newImageUrl) return;
    let user = JSON.parse(localStorage.getItem("loggedInuser"));

    const res = await fetch("http://localhost:5000/updateProfileImage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.userId, userImage: newImageUrl })
    });
    const data = await res.json();
    if (data.success) {
        user.userImage = newImageUrl;
        localStorage.setItem("loggedInuser", JSON.stringify(user));
        location.reload();
    }
};

const handleDeleteComment = async (commentId, postOwnerId) => {
    if (!confirm("Delete comment?")) return;
    let user = JSON.parse(localStorage.getItem("loggedInuser"));
    await fetch(`http://localhost:5000/deleteComment/${commentId}/${user.userId}/${postOwnerId}`, { method: "DELETE" });
    location.reload();
};

const handleEditComment = async (commentId, oldText) => {
    const newText = prompt("Edit comment:", oldText);
    if (!newText || newText === oldText) return;
    let user = JSON.parse(localStorage.getItem("loggedInuser"));
    await fetch("http://localhost:5000/editComment", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, commentText: newText, userId: user.userId })
    });
    location.reload();
};

const handleDeleteAccount = async () => {
    if (!confirm("Delete account forever?")) return;
    let user = JSON.parse(localStorage.getItem("loggedInuser"));
    const res = await fetch(`http://localhost:5000/deleteUser/${user.userId}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
        localStorage.clear();
        window.location.href = "/index.html";
    }
};