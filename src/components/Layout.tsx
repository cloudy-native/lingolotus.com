import React from 'react';
import { Box, Container, Flex, Link, Button, useColorMode, useColorModeValue, Heading, HStack, IconButton } from '@chakra-ui/react';
import { Link as GatsbyLink } from 'gatsby';
import { FaMoon, FaSun, FaGraduationCap, FaHome, FaBook, FaInfo } from 'react-icons/fa';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      {/* Header/Navigation */}
      <Box 
        as="header" 
        py={4} 
        bg={bgColor} 
        color={textColor}
        borderBottomWidth="1px"
        borderColor={borderColor}
        position="sticky"
        top={0}
        zIndex={10}
        boxShadow="sm"
      >
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            {/* Logo/Brand */}
            <HStack as={GatsbyLink} to="/" spacing={2}>
              <FaGraduationCap size="24px" />
              <Heading size="md">Flashcard App</Heading>
            </HStack>
            
            {/* Navigation Links */}
            <HStack spacing={8} display={{ base: 'none', md: 'flex' }}>
              <Link as={GatsbyLink} to="/" _hover={{ textDecoration: 'none' }}>
                <HStack spacing={1}>
                  <FaHome />
                  <Box>Home</Box>
                </HStack>
              </Link>
              <Link as={GatsbyLink} to="/collections" _hover={{ textDecoration: 'none' }}>
                <HStack spacing={1}>
                  <FaBook />
                  <Box>Collections</Box>
                </HStack>
              </Link>
              {/* <Link as={GatsbyLink} to="/about" _hover={{ textDecoration: 'none' }}>
                <HStack spacing={1}>
                  <FaInfo />
                  <Box>About</Box>
                </HStack>
              </Link> */}
            </HStack>
            
            {/* Right side items: Color Mode Toggle */}
            <HStack>
              <IconButton
                aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
                icon={colorMode === 'light' ? <FaMoon /> : <FaSun />}
                onClick={toggleColorMode}
                variant="ghost"
              />
            </HStack>
          </Flex>
        </Container>
      </Box>
      
      {/* Main Content */}
      <Box as="main" flex="1">
        {children}
      </Box>
      
      {/* Footer */}
      <Box 
        as="footer" 
        py={8} 
        bg={useColorModeValue('gray.100', 'gray.900')}
        color={textColor}
        borderTopWidth="1px"
        borderColor={borderColor}
      >
        <Container maxW="container.xl">
          <Flex 
            direction={{ base: 'column', md: 'row' }} 
            justify="space-between" 
            align="center"
            textAlign={{ base: 'center', md: 'left' }}
          >
            <Box mb={{ base: 4, md: 0 }}>
              <HStack justify={{ base: 'center', md: 'flex-start' }} mb={2}>
                <FaGraduationCap size="24px" />
                <Heading size="md">Flashcard App</Heading>
              </HStack>
              <Box fontSize="sm">© {new Date().getFullYear()} Flashcard App. All rights reserved.</Box>
            </Box>
            
            <HStack spacing={6}>
              <Link as={GatsbyLink} to="/">Home</Link>
              <Link as={GatsbyLink} to="/collections">Collections</Link>
              <Link as={GatsbyLink} to="/about">About</Link>
            </HStack>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;