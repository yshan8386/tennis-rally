export type Player = { id: string; name: string };

export type MatchSlot = {
  teamA: [string, string];
  teamB: [string, string];
  courtNo: number;
};

export type BracketRound = {
  roundNo: number;
  matches: MatchSlot[];
};

/**
 * KDK(한울) 방식 대진표 생성.
 * 참가자를 4인 그룹으로 나누고, 각 그룹 내에서 3라운드(모든 파트너 조합)를 생성한다.
 * 인원이 4의 배수가 아닐 경우, 마지막 그룹 크기를 3으로 허용한다.
 */
export function generateKDKBracket(players: Player[]): BracketRound[] {
  if (players.length < 4) return [];

  // 무작위 셔플
  const shuffled = [...players].sort(() => Math.random() - 0.5);

  // 4인 그룹 분할 (마지막 그룹이 3명이면 통합)
  const groups: Player[][] = [];
  for (let i = 0; i < shuffled.length; i += 4) {
    const group = shuffled.slice(i, i + 4);
    if (group.length === 3 && groups.length > 0) {
      // 3명 남으면 이전 그룹과 합쳐서 7명 그룹 → 다시 3+4로 분리
      const prev = groups.pop()!;
      const merged = [...prev, ...group];
      groups.push(merged.slice(0, 4));
      groups.push(merged.slice(4)); // 3명 그룹
    } else if (group.length >= 4) {
      groups.push(group);
    }
    // 1~2명 남는 경우는 무시
  }

  // 각 그룹의 파트너 조합 (3라운드)
  const combos: [number, number, number, number][] = [
    [0, 1, 2, 3], // A+B vs C+D
    [0, 2, 1, 3], // A+C vs B+D
    [0, 3, 1, 2], // A+D vs B+C
  ];

  const rounds: BracketRound[] = [];

  for (let r = 0; r < 3; r++) {
    const matches: MatchSlot[] = [];
    let courtNo = 1;

    for (const group of groups) {
      if (group.length === 4) {
        const [a, b, c, d] = combos[r];
        matches.push({
          teamA: [group[a].id, group[b].id],
          teamB: [group[c].id, group[d].id],
          courtNo: courtNo++,
        });
      } else if (group.length === 3) {
        // 3명 그룹은 한 사람이 쉬는 라운드 — 2명이 게임, 나머지는 다음 라운드
        // 라운드별로 쉬는 사람 순환
        const rest = r % 3;
        const playing = group.filter((_, i) => i !== rest);
        if (playing.length === 2) {
          // 2명만 있으므로 매치 자체를 스킵하거나 다른 그룹과 섞기
          // 단순 구현: 이 그룹은 이 라운드에 매치 없음
        }
      }
    }

    if (matches.length > 0) {
      rounds.push({ roundNo: r + 1, matches });
    }
  }

  return rounds;
}
