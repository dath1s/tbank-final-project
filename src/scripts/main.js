function createPost(post) {
    const postHTML = `
        <div class="post__header">
            <a href="/profile/${post.author}" class="profile-link">
                <img src="../images/default_profile_picture.svg" alt="Profile" class="profile-picture"
                     id="profile-picture">
                <div class="user-name">
                    ${post.authorName}
                </div>
            </a>
        </div>

        <div class="post__body">
            ${post.content}
        </div>

        <div class="post__footer">
            <button class="like-button" id="like-button" data-post-id="${post.id}">
                <span class="not_like_heart">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5.5C9.8 3 5.5 3.5 4 7C2.5 10.5 4.5 14.5 12 19C19.5 14.5 21.5 10.5 20 7C18.5 3.5 14.2 3 12 5.5Z"
                            stroke="black"
                            stroke-width="3"
                            stroke-linejoin="round"/>
                    </svg>
                </span>
                <span class="like_heart ${post.isLiked ? 'show-like' : ''}">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="red" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5.5C9.8 3 5.5 3.5 4 7C2.5 10.5 4.5 14.5 12 19C19.5 14.5 21.5 10.5 20 7C18.5 3.5 14.2 3 12 5.5Z"
                            stroke="black"
                            stroke-width="3"
                            stroke-linejoin="round"/>
                    </svg>
                </span>
                <span class="like_counter">
                    ${post.likesCount}
                </span>
            </button>
            <button class="comment-button" id="comment-button" data-post-id="${post.id}">
                Комментарии ${post.comments.length}
            </button>
        </div>
    `

    return postHTML;
}

document.addEventListener("DOMContentLoaded", async () => {
    const enterBut = document.getElementById('not_auth__enter');
    const registerBut = document.getElementById('not_auth__register');
    const logoutBut = document.getElementById('auth__exit');
    const profileBut = document.getElementById('profile_picture');

    const postsField = document.getElementById('posts-field');

    const userAuthStatus = await fetch('http://localhost:9999/', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json;charset=utf-8',
        },
        credentials: "include"
    });

    if (userAuthStatus.ok) {
        enterBut.classList.add('not-display');
        registerBut.classList.add('not-display');
        logoutBut.classList.remove('not-display');
        profileBut.classList.remove('not-display');
    } else {
        logoutBut.classList.add('not-display');
        profileBut.classList.add('not-display');
        enterBut.classList.remove('not-display');
        registerBut.classList.remove('not-display');
    }

    logoutBut.addEventListener("click", async () => {
        const logoutReq = await fetch('http://localhost:9999/api/logout', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json;charset=utf-8',
            },
            credentials: "include"
        });
        window.location.reload();
    });

    enterBut.addEventListener("click", () => {
        window.location.href = 'http://localhost:9998/sign#sign-in';
    });

    registerBut.addEventListener("click", () => {
        window.location.href = 'http://localhost:9998/sign#sign-up';
    });

    const allPosts = (await fetch('http://localhost:9999/api/posts', {
        method: 'GET',
        headers: {
            'Content-type': 'application/json;charset=utf-8',
        },
        credentials: "include"
    }));

    const allPostsData = await allPosts.json();

    if (allPosts.ok) {
        postsField.innerHTML = '';

        for (const post of allPostsData) {
            const newPost = document.createElement('div');
            newPost.classList.add('post');
            newPost.innerHTML = createPost(post);

            const likeButton = newPost.querySelector('.like-button');
            const likeHeart = newPost.querySelector('.like_heart');
            const likeCounter = newPost.querySelector('.like_counter');

            const commentButton = newPost.querySelector('.comment-button');

            const postId = likeButton.dataset.postId;

            likeButton.addEventListener("click", async (event) => {
                const likeAction = await fetch(`http://localhost:9999/api/posts/${postId}/like`, {
                    method: 'POST',
                    headers: {
                        'Content-type': 'application/json;charset=utf-8',
                    },
                    credentials: "include"
                });
                if (likeAction.ok) {
                    const likeData = await likeAction.json();

                    if (likeData.showLike) {
                        likeHeart.classList.add('show-like');
                    } else {
                        likeHeart.classList.remove('show-like');
                    }
                    likeCounter.innerHTML = likeData.likesCount;
                }
            });

            commentButton.addEventListener("click", () => {
                const postId = commentButton.dataset.postId;
                console.log(`Comment: ${postId}`);
            });

            postsField.appendChild(newPost);
        }
    }
});