import { logger } from "./logger.js"

function sleep({ duration }) {
  logger.info(`Sleeping for ${duration} miliseconds`);
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

function loopInPromise({ fn, args, shouldItBeStopped, preExecutionHook, postExecutionHook, delayBetweenExecutions, errorHandler }) {
  const _this = this
  delayBetweenExecutions = delayBetweenExecutions ? delayBetweenExecutions : 0
  if (shouldItBeStopped.call(_this, args)) {
    // it's time to break the loop
    logger.info(`Breaking condition reached for ${JSON.stringify(args)}`)
    return Promise.resolve()
  }
  return new Promise((resolve, reject) => {
    resolve()
  })
    .then(function (params) {
      logger.debug(`Inside a pre execution hook for ${JSON.stringify(args)}`)
      return preExecutionHook.call(_this, args);
    })
    .then(() => {
      return (async () => {
        return await fn.call(_this, args);
      })().catch(e => {
        logger.info(`Recieved an error while running function ${fn.name} in loop ${e}, throwing it again`)
        throw e
      }); // Catches it
    })
    .then(function (resp) {
      logger.debug(`Inside a post execution hook for ${JSON.stringify(args)}`)
      return postExecutionHook.call(_this, args, resp);
    })
    .catch((err) => {
      // return
      if(errorHandler){
        return errorHandler.call(_this, err, args);
      }
      logger.error(`<<<<<<<<<<<<>>>>>>> ${err}`)
    })
    .finally(() => {
      // this is going to be execute in any case
      logger.info(`Delayed b/w execution is configured and hence taking a pause for ${delayBetweenExecutions}`)
      return setTimeout(() => {
        // prepration for next execution
        loopInPromise.apply(_this, arguments);
      }, delayBetweenExecutions);
    })
}

function tradingSessionStartTime(tradeDay) {
  return tradeDay.clone().hour(9).minute(0).second(0)
}

function tradingSessionEndTime(tradeDay) {
  return tradeDay.clone().hour(15).minute(30).second(0)
}

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}


export { sleep, loopInPromise, tradingSessionStartTime, tradingSessionEndTime, randomIntFromInterval }