import { HStack, Icon, IconButton } from "@chakra-ui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

interface CardNavigationProps {
    goToPrevCard: () => void;
    goToNextCard: () => void;
    isFirstCard: boolean;
    isLastCard: boolean;
}

const CardNavigation: React.FC<CardNavigationProps> = ({
    goToPrevCard,
    goToNextCard,
    isFirstCard,
    isLastCard,
}) => {
    return (
        <HStack spacing={4} justify="center" mt={6}>
            <IconButton
                aria-label="Previous card"
                icon={<Icon as={ChevronLeft} />}
                onClick={goToPrevCard}
                isDisabled={isFirstCard}
                colorScheme="gray"
            />
            <IconButton
                aria-label="Next card"
                icon={<Icon as={ChevronRight} />}
                onClick={goToNextCard}
                isDisabled={isLastCard}
                colorScheme="gray"
            />
        </HStack>
    );
};

export default CardNavigation;
