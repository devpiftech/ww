
import React from 'react';
import GameLobby from '@/components/multiplayer/GameLobby';
import OnlinePlayers from '@/components/multiplayer/OnlinePlayers';

const QuizLobby: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <GameLobby 
          gameName="Casino Quiz"
          showChat={true}
        />
      </div>
      <div>
        <OnlinePlayers
          showGame={true}
          showCount={true}
        />
      </div>
    </div>
  );
};

export default QuizLobby;
