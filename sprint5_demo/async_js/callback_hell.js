// Simulated callback-based fetch helper
function fetchUser(userId, callback) {
  setTimeout(() => {
    callback(null, { id: userId, name: "Alice" });
  }, 1000);
}

function fetchPosts(user, callback) {
  setTimeout(() => {
    callback(null, [{ id: 101, title: "Hello World", userId: user.id }]);
  }, 1000);
}

function fetchComments(post, callback) {
  setTimeout(() => {
    callback(null, ["Great post!", "Very helpful."]);
  }, 1000);
}

fetchUser(1, (err, user) => {
    if (err) return console.error(err);

    fetchPosts(user, (err, posts) => {
        if (err) return console.error(err);
        
        fetchComments(posts[0], (err, comments) => {
            if (err) return console.error(err);
            
            console.log(user)
            console.log(posts)
            console.log(comments)
        })
    })
})

// THEN/CATCH CHAINING
fetch("/api/user/1")
    .then(res => res.json())
    .then(user => fetch(`/api/posts?userId=${user.id}`))
    .then(res => res.json())
    .then(posts => fetch(`/api/comments?postId=${posts[0].id}`))
    .then(res => res.json())
    .then(comments => console.log(comments))
    .catch(err => console.error(err))




// ASYNC / AWAIT
async function loadUserData(user_id){
    try {
        const userResponse = await fetch(`/api/user/${user_id}`);
        const user = await userResponse.json();

        const postsRes = await fetch(`/api/posts?userId=${user.id}`);
        const posts = await postsRes.json();

        const commentsRes = await fetch(`/api/comments?postId=${posts[0].id}`);
        const comments = await commentsRes.json();

        console.log({user, posts, comments})
    } catch (error) {
        console.error(error)
    }
}