import Riddle from "../components/Riddle";
import { GuessModel } from "../lib/guess/guess.model";
import { addGuess } from "../lib/guess/guess.service";

export default function Page() {

  const guessRiddle = async (riddle: GuessModel) => {
    console.log("guessRiddle called with:", riddle);
    const response = await addGuess(riddle);
    console.log(response);
  };

  return (
    <main className="flex items-center justify-center min-h-screen p-24">
      <div className="flex flex-col bg-white rounded-lg shadow-xl p-16">
        <h2 className="text-2xl">Riddle Chain</h2>
        <p className="text-lg">A decentralized riddle game</p>
        <p className="text-sm">Built with Next.js and Tailwind CSS</p>
        <p className="text-sm">Version 0.1.0</p>

        <div className="flex items-center mt-4 space-x-8">
          <label htmlFor="riddle-input">Riddle input</label>
          <input
            id="riddle-input"
            type="text"
            className="border border-gray-300 rounded-lg px-4 py-2 ml-2"
            placeholder="Enter your riddle here"
          />
        </div>
        <div className="flex">
          <span>Previous winners:</span>
          <span>Test, Arpbb aaand Mooore!</span>
        </div>

        <button className="mt-4 bg-lime-400 p-4 rounded-xl ">Submit riddle</button>

        <div className="flex">
          <Riddle guessRiddleCallback={guessRiddle} />

        </div>
      </div>
    </main>
  );
}
