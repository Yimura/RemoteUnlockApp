import React, { createContext, useState } from 'react';
import { PaginatorHeader } from './Header';
import { PaginatorBody } from './Body';
import { PaginatorFooter } from './Footer';

interface PaginatorContextProps {
    currentPage: number;
    setPage: (page: number) => void;

    isNextEnabled: boolean;
    setNextEnabled: (toggle: boolean) => void;
}
const defaultProviderContext: PaginatorContextProps = {
    currentPage: 1,
    setPage: () => { },

    isNextEnabled: true,
    setNextEnabled: () => { },
} as const;

export const PaginatorContext = createContext<PaginatorContextProps>(defaultProviderContext);

export interface PaginatorProps {
    currentPage: number;
    setPage: (page: number) => void;

    children: React.ReactNode[];
}
export function Paginator({ currentPage, setPage, children }: PaginatorProps): React.JSX.Element {
    const [isNextEnabled, setNextEnabled] = useState(defaultProviderContext.isNextEnabled);

    return (
        <PaginatorContext.Provider value={{
            currentPage,
            setPage,
            isNextEnabled,
            setNextEnabled,
        }}>
            <PaginatorHeader currentPage={currentPage} numberOfPages={children.length} />
            <PaginatorBody activePage={children[currentPage - 1]} />
            <PaginatorFooter currentPage={currentPage} numberOfPages={children.length} setPage={setPage} isNextEnabled={isNextEnabled} />
        </PaginatorContext.Provider>
    );
}
