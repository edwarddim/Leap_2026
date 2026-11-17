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

// ⬇️ CALLBACK HELL (Pyramid of Doom)
fetchUser(1, (err, user) => {
  if (err) return console.error(err);
  
  fetchPosts(user, (err, posts) => {
    if (err) return console.error(err);
    
    fetchComments(posts[0], (err, comments) => {
      if (err) return console.error(err);
      
      console.log("User:", user);
      console.log("Posts:", posts);
      console.log("Comments:", comments);
    });
  });
});




fetch("/api/user/1")
  .then(res => res.json())
  .then(user => fetch(`/api/posts?userId=${user.id}`))
  .then(res => res.json())
  .then(posts => fetch(`/api/comments?postId=${posts[0].id}`))
  .then(res => res.json())
  .then(comments => console.log(comments))
  .catch(err => console.error("Error:", err));




async function loadUserData() {
  try {
    const userRes = await fetch("/api/user/1");
    const user = await userRes.json();

    const postsRes = await fetch(`/api/posts?userId=${user.id}`);
    const posts = await postsRes.json();

    const commentsRes = await fetch(`/api/comments?postId=${posts[0].id}`);
    const comments = await commentsRes.json();

    console.log({ user, posts, comments });
  } catch (err) {
    console.error("Error loading data:", err);
  }
}

// loadUserData();



// DEFINE PROMISE
// const noMondays = new Promise((resolve, reject) => {
//     // IF TODAY IS NOT MONDAY - SUCCESS
//     if (new Date().getDay() !== 2) {
//         resolve("Good, it's not Tuesday!");
//     } else {
//         reject("NO MORE MONDAYS! THREE DAY WEEKENDS FOREVER");
//     }
// });

// CHECK PROMISE
// noMondays
//     .then(res => console.log("THEN: ", res))
//     .catch(err => console.log("CATCH: ", err))

// thenable

const axios = (url) => new Promise((resolve, reject) => {
    console.log(`YOU ARE MAKING A REQUEST TO ${url}`)
    let randomNumber = Math.floor(Math.random() * 10)
    if(randomNumber === 0){
        reject({
            'status' : 'error',
            'message': 'something went wrong'
        })
    }
    else{
        resolve({
            'status' : 'ok',
            'message': 'here is your data'
        })
    }
})

axios("https://pokeapi.co/api/v2/pokemon")
    .then(response => console.log("THEN: ", response))
    .catch(error => console.log('ERROR: ', error))

try {
  const result = await axios("https://pokeapi.co/api/v2/pokemon")
  console.log(result)
} catch (err) {
  console.error(err)
}