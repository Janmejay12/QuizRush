package com.example.QuizRush;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan({"com.example.QuizRush"})
public class QuizRushApplication {

	public static void main(String[] args) {
		SpringApplication.run(QuizRushApplication.class, args);
	}

}
