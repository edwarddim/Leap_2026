// DEFINE PROMISE
const noMondays = new Promise((resolve, reject) => {
    // IF TODAY IS NOT MONDAY - SUCCESS
    if(new Date().getDay() !== 1){
        resolve("It is not a Monday! Hooray!")
    } else {
        reject("No more Mondays")
    }
})


const axios = (url) => new Promise((resolve, reject) => {
    console.log(`YOU ARE MAKING A REQUEST TO ${url}`)
    let randomNumber = Math.floor(Math.random() * 10)
    if(randomNumber === 0){
        reject({
            'status': 'error',
            'message' : 'something went wrong'
        })
    } else{
        resolve({
            'status': 'ok',
            'message' : 'here is your data'       
        })
    }
})


axios("localhost:8080/api/users")
    .then(res => console.log('THEN: ', res))
    .catch(err => console.error('CATCH: ', err))

