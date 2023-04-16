import axios from 'axios';
import { parse } from 'csv-parse/sync';

interface RawChoreography {
    title: string;
    warnings: string;
    artists: string;
    choreographer: string;
    difficulties: string;
    bpm: string;
    length: string;
    date: string;
    link: string;
    notes: string;
}

export enum Warnings {
    Explicit = 'explicit',
    Challenging = 'challenging',
    Content_Strike = 'content_strike',
}

export enum Difficulties {
    Beginner = 'beginner',
    Regular = 'regular',
    Expert = 'expert',
    Cardio = 'cardio',
}

export interface Choreography {
    id: string;
    title: string;
    warnings: Warnings[];
    artists: string[];
    choreographer: string;
    difficulties: Difficulties[];
    bpm: number;
    length: number;
    date: Date;
    link: string;
    notes?: string;
}

interface ValidationMessage {
    field: keyof Choreography;
    message: string;
}

class ChoreographiesFetcher {
    constructor(private readonly url: string) {}

    async downloadCSV() {
        const response = await axios.get(this.url);

        const data: RawChoreography[] = parse(response.data.toString(), {
            from_line: 4,
            columns: ['title', 'warnings', 'artists', 'choreographer', 'difficulties', 'bpm', 'length', 'date', 'link', 'notes'],
        });

        return data;
    }

    parseWarnings(input: string) {
        const warnings = [];

        if (input.includes('[E]')) warnings.push(Warnings.Explicit);
        if (input.includes('[C]')) warnings.push(Warnings.Challenging);
        if (input.includes('[X]')) warnings.push(Warnings.Content_Strike);

        return warnings;
    }

    parseArtists(input: string) {
        const artists = input.split(/,|&/).map((artist) => artist.trim().toLowerCase());
        return artists;
    }

    parseDifficulties(input: string) {
        const lowerCaseInput = input.toLowerCase();

        const difficulties = [];

        if (lowerCaseInput.includes('easy') || lowerCaseInput.includes('ez') || lowerCaseInput.includes('beginner'))
            difficulties.push(Difficulties.Beginner);
        if (lowerCaseInput.includes('regular') || lowerCaseInput.includes('reg')) difficulties.push(Difficulties.Regular);
        if (lowerCaseInput.includes('expert') || lowerCaseInput.includes('exp')) difficulties.push(Difficulties.Expert);
        if (lowerCaseInput.includes('cardio')) difficulties.push(Difficulties.Cardio);

        if (difficulties.length === 0) difficulties.push(Difficulties.Regular);

        return difficulties;
    }

    parseLength(input: string) {
        const [minutes, seconds] = input.split(':').map((value) => parseInt(value));
        return minutes * 60 + seconds;
    }

    generateId(choreography: Omit<Choreography, 'id'>) {
        const parts = [choreography.title, ...choreography.artists, choreography.choreographer];
        return parts.join('-').toLowerCase();
    }

    transformChoreography(RawChoreography: RawChoreography): Choreography {
        const choreography = {
            title: RawChoreography.title.trim(),
            warnings: this.parseWarnings(RawChoreography.warnings),
            artists: this.parseArtists(RawChoreography.artists),
            choreographer: RawChoreography.choreographer.trim(),
            difficulties: this.parseDifficulties(RawChoreography.difficulties),
            bpm: parseInt(RawChoreography.bpm),
            length: this.parseLength(RawChoreography.length),
            date: new Date(RawChoreography.date),
            link: RawChoreography.link.trim(),
            notes: RawChoreography.notes.trim() || undefined,
        };

        (choreography as Choreography).id = this.generateId(choreography);

        return choreography as Choreography;
    }

    validateChoreography(choreography: Choreography) {
        const messages: ValidationMessage[] = [];

        if (choreography.title.length === 0) messages.push({ field: 'title', message: 'Title is required' });
        if (choreography.artists.length === 0) messages.push({ field: 'artists', message: 'At least one artist is required' });
        if (choreography.choreographer.length === 0) messages.push({ field: 'choreographer', message: 'Choreographer is required' });
        if (choreography.difficulties.length === 0) messages.push({ field: 'difficulties', message: 'At least one difficulty is required' });
        if (Number.isNaN(choreography.bpm)) messages.push({ field: 'bpm', message: 'BPM is required' });
        if (Number.isNaN(choreography.length)) messages.push({ field: 'length', message: 'Length is required' });

        if (choreography.link.match(/https:\/\/cdn.discordapp.com\/attachments\/\d+\/\d+\/.+/) === null) {
            messages.push({ field: 'link', message: 'Link is invalid' });
        }

        return messages;
    }

    async fetch() {
        const rawChoreographies = await this.downloadCSV();
        const choreographies = rawChoreographies.map((rawChoreography) => this.transformChoreography(rawChoreography));

        const validCoreographies = choreographies.reduce((acc, choreography) => {
            const validationMessages = this.validateChoreography(choreography);

            if (validationMessages.length) {
                console.log(`Choreography "${choreography.title}" is invalid`);
                console.log(validationMessages);

                return acc;
            }

            return [...acc, choreography];
        }, [] as Choreography[]);

        return validCoreographies;
    }
}

export default ChoreographiesFetcher;
