import React, { createContext, useContext, useState } from 'react';
import { PaginatorHeader } from './Header';
import { PaginatorBody } from './Body';
import { PageUpdateEventHandler, PaginatorFooter } from './Footer';

interface PaginatorContextProps {
    currentPage: number;
    setPage: (page: number) => void;

    setPreviousButtonLabel: (label: string | null) => void;
    setNextButtonLabel: (label: string | null) => void;

    isNextEnabled: boolean;
    setNextEnabled: (toggle: boolean) => void;
}

const PaginatorContext = createContext<PaginatorContextProps | null>(null);

export const usePaginator = (): PaginatorContextProps => {
    const ctx = useContext(PaginatorContext);
    if (!ctx) {
        throw new Error('usePaginator must be used inside <Paginator>');
    }
    return ctx;
};

export interface PaginatorProps {
    currentPage: number;
    setPage: (page: number) => void;

    onPageUpdate?: PageUpdateEventHandler;

    children: React.ReactNode[];
}
export function Paginator({ currentPage, setPage, onPageUpdate, children }: PaginatorProps): React.JSX.Element {
    const [isNextEnabled, setNextEnabled] = useState(true);
    const [previousButtonLabel, setPreviousButtonLabel] = useState<string | null>(null);
    const [nextButtonLabel, setNextButtonLabel] = useState<string | null>(null);

    return (
        <PaginatorContext.Provider value={{
            currentPage,
            setPage,
            setPreviousButtonLabel,
            setNextButtonLabel,
            isNextEnabled,
            setNextEnabled,
        }}>
            <PaginatorHeader currentPage={currentPage} numberOfPages={children.length} />
            <PaginatorBody activePage={children[currentPage - 1]} />
            <PaginatorFooter
                currentPage={currentPage}
                numberOfPages={children.length}
                setPage={setPage}
                previousButtonLabel={previousButtonLabel}
                nextButtonLabel={nextButtonLabel}
                isNextEnabled={isNextEnabled}
                onPageUpdate={onPageUpdate} />
        </PaginatorContext.Provider>
    );
}
