import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text } from 'ink';
import { useInput } from 'ink';


const MAP_WIDTH = 20;
const MAP_HEIGHT = 10;

type Position = {
	x: number;
	y: number;
};

type Player = {
    hp: number;
    attack: number;
};

type Message = {
    text: string;
    color: string;
};

const generateMap = (floor: number): [string[][], Position, Position[], Position[]] => {
    const map = Array.from({ length: MAP_HEIGHT }, () => Array(MAP_WIDTH).fill('.'));

    // Add walls
    for (let y = 0; y < MAP_HEIGHT; y++) {
        map[y][0] = '#';
        map[y][MAP_WIDTH - 1] = '#';
    }
    for (let x = 0; x < MAP_WIDTH; x++) {
        map[0][x] = '#';
        map[MAP_HEIGHT - 1][x] = '#';
    }
    for (let i = 0; i < 15; i++) {
        map[Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1][Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1] = '#';
    }


    const placeObject = (char: string) => {
        let x, y;
        do {
            x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
            y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;
        } while (map[y][x] !== '.');
        map[y][x] = char;
        return { x, y };
    };

    const playerPos = placeObject('@');

    const numEnemies = 2 + floor;
    const enemyPositions: Position[] = [];
    for (let i = 0; i < numEnemies; i++) {
        enemyPositions.push(placeObject('E'));
    }

    const numItems = 3;
    const itemPositions: Position[] = [];
    for (let i = 0; i < numItems; i++) {
        itemPositions.push(placeObject('$'));
    }

    return [map, playerPos, enemyPositions, itemPositions];
};


export const RoguelikeGame = () => {
    const [map, setMap] = useState<string[][]>([]);
    const [playerPos, setPlayerPos] = useState<Position>({ x: 0, y: 0 });
    const [player, setPlayer] = useState<Player>({ hp: 10, attack: 2 });
    const [enemyPositions, setEnemyPositions] = useState<Position[]>([]);
    const [itemPositions, setItemPositions] = useState<Position[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [gameOver, setGameOver] = useState(false);
    const [turn, setTurn] = useState(0);
    const [floor, setFloor] = useState(1);

    const addMessage = (text: string, color: string = 'white') => {
        setMessages(prev => [{ text, color }, ...prev].slice(0, 3));
    };

    const resetGame = useCallback((currentFloor: number) => {
        const [newMap, newPlayerPos, newEnemyPositions, newItemPositions] = generateMap(currentFloor);
        setMap(newMap);
        setPlayerPos(newPlayerPos);
        setEnemyPositions(newEnemyPositions);
        setItemPositions(newItemPositions);
        setPlayer({ hp: 10, attack: 2 });
        setFloor(currentFloor);
        setTurn(0);
        setGameOver(false);
        setMessages([]);
        addMessage(`You have entered floor ${currentFloor}.`, 'cyan');
    }, []);

    useEffect(() => {
        resetGame(1);
    }, [resetGame]);

    


    useInput((input, key) => {
        if (gameOver) {
            if (input === 'r') {
                resetGame(1);
            }
            return;
        }
        if (!playerPos) return;

        let newX = playerPos.x;
        let newY = playerPos.y;

        if (key.upArrow || input === 'w') newY--;
        if (key.downArrow || input === 's') newY++;
        if (key.leftArrow || input === 'a') newX--;
        if (key.rightArrow || input === 'd') newX++;

        if (newX < 0 || newX >= MAP_WIDTH || newY < 0 || newY >= MAP_HEIGHT) {
            return;
        }

        const targetCell = map[newY][newX];

        if (targetCell === '#') {
            return;
        }

        let newTurn = turn + 1;
        setTurn(newTurn);

        if (targetCell === '$') {
            addMessage('You found an item!', 'yellow');
            const newItems = itemPositions.filter(p => p.x !== newX || p.y !== newY);
            setItemPositions(newItems);
            if (newItems.length === 0) {
                addMessage('All items collected! Proceeding to the next floor.', 'cyan');
                resetGame(floor + 1);
                return;
            }
        }

        if (targetCell === 'E') {
            addMessage(`You attacked an enemy for ${player.attack} damage!`, 'green');
            setEnemyPositions(enemyPositions.filter(p => p.x !== newX || p.y !== newY));
        }

        const newMap = map.map(row => [...row]);
        newMap[playerPos.y][playerPos.x] = '.';
        newMap[newY][newX] = '@';

        setMap(newMap);
        setPlayerPos({ x: newX, y: newY });
    });

    const renderCell = (cell: string, x: number, y: number) => {
        if (playerPos && playerPos.x === x && playerPos.y === y) {
            return <Text color="green">@</Text>;
        }
        if (enemyPositions.some(p => p.x === x && p.y === y)) {
            return <Text color="red">E</Text>;
        }
        if (itemPositions.some(p => p.x === x && p.y === y)) {
            return <Text color="yellow">$</Text>;
        }
        return <Text>{cell}</Text>;
    };

    if (!playerPos) {
        return <Text>Initializing...</Text>;
    }

    return (
        <Box borderStyle="single" padding={1} flexDirection="column">
            <Box justifyContent="space-between">
                <Text>HP: {player.hp}/10</Text>
                <Text>Attack: {player.attack}</Text>
                <Text>Floor: {floor}</Text>
                <Text>Turn: {turn}</Text>
            </Box>
            <Box flexDirection="column" marginTop={1}>
                {map.map((row, y) => (
                    <Box key={y}>
                        {row.map((cell, x) => (
                            <Box key={x}>{renderCell(cell, x, y)}</Box>
                        ))}
                    </Box>
                ))}
            </Box>
            <Box flexDirection="column" marginTop={1}>
                {messages.map((msg, i) => (
                    <Text key={i} color={msg.color}>{msg.text}</Text>
                ))}
            </Box>
            {gameOver && (
                <Box marginTop={1}>
                    <Text color="red">Game Over! Press 'r' to retry.</Text>
                </Box>
            )}
        </Box>
    );
};
