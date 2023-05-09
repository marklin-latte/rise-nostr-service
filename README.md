## Description

This is a 

## Installation

```bash
$ npm install
```

## Running the Client 


```
npm run script send {message}
```

## Questions

### 1. What are some of the challenges you faced while working on Phase 1?

* Designing the architecture of the application, and how to make it support phase 2~5 
* Write the code in a way that is easy to maintain and extend
* Write the part of the NIP-01 protocol, because I don't have a lot of experience with the protocol

### 2. What kind of failures do you expect to a project such as DISTRISE to encounter?

* The DISTRISE server is a websocket server, so it is possible that the server will encounter a lot of long connections, and the server will face the problem of resource exhaustion. For example the number of file descriptors is exhausted. the other is the cpu resource exhaustion problem due to the large number of connections and emit events.
* The DISTRISE server has a log of encode and decode, so it is possible that the server will encounter a cpu resource exhaustion problem.

## License

The project [MIT licensed](LICENSE).
