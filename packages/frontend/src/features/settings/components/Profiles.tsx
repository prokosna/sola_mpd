import {
  Button,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Table,
  TableContainer,
  Tbody,
  Th,
  Thead,
  Tr,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";

import { CenterSpinner } from "../../loading";
import { MpdProfileForm, useMpdProfileState } from "../../profile";

import { ProfilesProfile } from "./ProfilesProfile";

/**
 * Profiles component for managing MPD profiles.
 *
 * This component displays a list of existing MPD profiles and provides
 * functionality to add new profiles. It uses the MpdProfileState and
 * renders a table of profiles with options to edit or delete them.
 *
 * @returns JSX element representing the Profiles component
 */
export function Profiles() {
  const mpdProfileState = useMpdProfileState();
  const { isOpen, onOpen, onClose } = useDisclosure();

  if (mpdProfileState === undefined) {
    return <CenterSpinner className="layout-border-top layout-border-left" />;
  }

  return (
    <>
      <VStack spacing={"12px"} align={"start"}>
        <Button onClick={onOpen}>Add</Button>
        <Divider></Divider>
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>NAME</Th>
                <Th>HOST</Th>
                <Th>PORT</Th>
                <Th>ACTION</Th>
              </Tr>
            </Thead>
            <Tbody>
              {mpdProfileState.profiles.map((profile, index) => (
                <ProfilesProfile
                  key={index}
                  {...{ index, profile, mpdProfileState }}
                />
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </VStack>
      <Modal isOpen={isOpen} onClose={onClose} size={"xl"} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalBody p={0}>
            <MpdProfileForm
              onProfileCreated={async () => {
                onClose();
              }}
            ></MpdProfileForm>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
