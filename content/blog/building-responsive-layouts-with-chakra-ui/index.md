---
title: "Building Responsive Layouts with Chakra UI"
date: "2025-01-10T12:00:00.000Z"
description: "Learn how to create beautiful, responsive layouts using Chakra UI's powerful layout components and style props in a Gatsby project."
author: "Chakra Team"
tags: ["Chakra UI", "Responsive Design", "Layout", "CSS"]
# featuredImage: "./responsive-design.jpg"
---

Creating responsive layouts that look great on all devices used to be a challenge. With Chakra UI, responsive design becomes much more straightforward and intuitive. In this guide, we'll explore how to leverage Chakra UI's layout system in your Gatsby projects.

## The Power of Chakra UI's Layout System

Chakra UI provides a comprehensive set of layout components that make building responsive interfaces simple:

- **Box**: The fundamental building block
- **Flex**: For one-dimensional layouts
- **Grid**: For two-dimensional layouts
- **SimpleGrid**: For responsive grid layouts without complex media queries
- **Stack**: For stacking elements with consistent spacing

These components, combined with Chakra's responsive style props, give you incredible flexibility.

## Responsive Style Props: The Game Changer

One of Chakra UI's most powerful features is its approach to responsive styles. Instead of writing media queries, you can specify different values at different breakpoints right in your component props:

```jsx
<Box
  width={{ base: "100%", md: "50%", lg: "33%" }}
  p={{ base: 4, md: 6, lg: 8 }}
  bg={{ base: "red.200", md: "blue.200" }}
>
  This box changes with screen size
</Box>
```

This approach:
- Keeps your styles co-located with your components
- Makes responsive patterns easy to visualize
- Reduces the need for custom CSS
- Encourages consistent spacing and sizing

## Building a Responsive Card Layout

Let's build a common UI pattern: a responsive card grid that shows 1 column on mobile, 2 on tablets, and 3 on desktop:

```jsx
import React from 'react';
import { SimpleGrid, Box, Heading, Text } from '@chakra-ui/react';

const CardGrid = ({ items }) => {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
      {items.map((item) => (
        <Box
          key={item.id}
          p={5}
          shadow="md"
          borderWidth="1px"
          borderRadius="lg"
          transition="transform 0.3s"
          _hover={{ transform: 'translateY(-5px)', shadow: 'lg' }}
        >
          <Heading fontSize="xl" mb={4}>{item.title}</Heading>
          <Text>{item.description}</Text>
        </Box>
      ))}
    </SimpleGrid>
  );
};

export default CardGrid;
```

## Creating a Responsive Navigation

Navigation is another critical UI element that needs to be responsive. Here's how you might implement a navigation that collapses to a hamburger menu on mobile:

```jsx
import React from 'react';
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  useColorModeValue,
  Stack,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';

const Links = ['Home', 'About', 'Services', 'Contact'];

const NavLink = ({ children }) => (
  <Box
    px={2}
    py={1}
    rounded={'md'}
    _hover={{
      textDecoration: 'none',
      bg: useColorModeValue('gray.200', 'gray.700'),
    }}
  >
    {children}
  </Box>
);

export default function Nav() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box bg={useColorModeValue('white', 'gray.900')} px={4}>
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        <IconButton
          size={'md'}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label={'Open Menu'}
          display={{ md: 'none' }}
          onClick={isOpen ? onClose : onOpen}
        />
        <HStack spacing={8} alignItems={'center'}>
          <Box>Logo</Box>
          <HStack as={'nav'} spacing={4} display={{ base: 'none', md: 'flex' }}>
            {Links.map((link) => (
              <NavLink key={link}>{link}</NavLink>
            ))}
          </HStack>
        </HStack>
        <Button variant={'solid'} colorScheme={'blue'} size={'sm'}>
          Sign In
        </Button>
      </Flex>

      {isOpen ? (
        <Box pb={4} display={{ md: 'none' }}>
          <Stack as={'nav'} spacing={4}>
            {Links.map((link) => (
              <NavLink key={link}>{link}</NavLink>
            ))}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
}
```

## Responsive Typography

Text also needs to scale appropriately across devices. Chakra makes this easy:

```jsx
<Heading
  fontSize={{ base: "xl", md: "2xl", lg: "3xl" }}
  lineHeight={{ base: 1.5, md: 1.2 }}
>
  This heading resizes based on screen width
</Heading>

<Text fontSize={{ base: "md", lg: "lg" }} maxW={{ base: "100%", md: "80%", lg: "60%" }}>
  This paragraph adjusts its font size and max width based on the screen size.
</Text>
```

## Best Practices for Responsive Design with Chakra UI

1. **Start mobile-first**: Define your base styles for mobile and then adjust for larger screens
2. **Use the responsive object syntax**: It's more readable than array syntax for complex components
3. **Leverage Stack components**: They handle spacing and direction automatically
4. **Use the SimpleGrid component**: It makes responsive grids incredibly easy
5. **Test on real devices**: Always verify your layouts on actual devices, not just in the browser's responsive mode

## Conclusion

Chakra UI completely transforms how we approach responsive design in React and Gatsby projects. By moving responsive logic into component props, your code becomes more declarative and easier to reason about.

This starter template includes many examples of responsive design patterns with Chakra UI. Explore the existing components and pages to see these principles in action, and adapt them to your project needs.

The combination of Gatsby's performance and Chakra UI's layout system gives you everything you need to build beautiful, responsive websites that work great on any device.