import ChallengeList from "./_components/challenge-list";
import CreateChallenge from "./_components/create-challenge";

export default function Challenges() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2">
        <ChallengeList />
      </div>
      <CreateChallenge />
    </div>
  );
}
