package com.example.QuizRush.mapper;

import com.example.QuizRush.dto.websocket.ParticipantDTO;
import com.example.QuizRush.entities.Participant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ParticipantMapper {

    @Mapping(target = "id", source = "id")
    @Mapping(target = "nickname", source = "nickname")
    @Mapping(target = "score", source = "score")
    @Mapping(target = "roomCode", source = "quiz.roomCode")
    ParticipantDTO toDTO(Participant participant);

    @Mapping(target = "quiz", ignore = true)
    Participant toEntity(ParticipantDTO participantDTO);
}