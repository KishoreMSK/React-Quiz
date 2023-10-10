import { useEffect, useReducer } from 'react'
import Header from './Header'
import Main from './Main'
import Loader from './Loader'
import Error from './Error'
import StartScreen from './StartScreen'
import Questions from './Questions'
import Progress from './Progress'

const initialState = {
  questions:[],
  //loading, error, ready, active, finished
  status: 'loading',
  index: 0,
  answer:null,
  points: 0
}

function reducer(state,action){
  switch(action.type){
    case 'dataReceived':
      return {
        ...state,
        questions: action.payload,
        status: 'ready'
      };
    case 'dataFailed':
      return{
        ...state,
        status: 'error'
      };
    case 'start':
      return{
        ...state,
        status: 'active'
      }
    case 'newAnswer':
      const question = state.questions.at(state.index);
      return {
        ...state,
        answer: action.payload,
        points:
          action.payload === question.correctOption
            ? question.points + state.points
            : state.points,
      };
    case 'nextQuestion':
      return{
        ...state,
        index: state.index + 1,
        answer: null
      }
    default:
      throw new Error('Unknown action')
  }
}

export default function App(){
  const [state,dispatch] = useReducer(reducer,initialState)
  const {questions ,status, index, answer, points} = state;
  const numQuestions = questions.length
  const maximumPossiblePoints = questions.reduce(
    (prev, cur) => prev + cur.points,0
  );
  console.log(maximumPossiblePoints);
  useEffect(() => {
    async function fetchData(){
      try {
        const res = await fetch(`http://localhost:8000/questions`);
        const data = await res.json();
        dispatch({ type: "dataReceived", payload: data });
      } catch (error) {
        dispatch({ type: "dataFailed" });
      }
    }
    fetchData();
  }, []);
  return (
    <div className="app">
      <Header />

      <Main>
        {status === "loading" && <Loader />}
        {status === "error" && <Error />}
        {status === "ready" && (
          <StartScreen numQuestions={numQuestions} dispatch={dispatch} />
        )}
        {status === "active" && (
          <>
            <Progress
              index={index + 1}
              numQuestions={numQuestions}
              points={points}
              maxPossiblePoints={maximumPossiblePoints}
              answer={answer}
            />
            <Questions
              questions={questions[index]}
              dispatch={dispatch}
              answer={answer}
            />
          </>
        )}
      </Main>
    </div>
  );
}