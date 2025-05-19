package com.example.QuizRush.mapper;

import com.example.QuizRush.dto.websocket.QuestionDTO;
import com.example.QuizRush.entities.Question;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface QuestionMapper {

    @Mapping(target = "id", source = "id")
    @Mapping(target = "text", source = "text")
    @Mapping(target = "duration", source = "duration")
    @Mapping(target = "points", source = "points")
    @Mapping(target = "options", source = "options")
    QuestionDTO toDTO(Question question);

    Question toEntity(QuestionDTO questionDTO);
}

